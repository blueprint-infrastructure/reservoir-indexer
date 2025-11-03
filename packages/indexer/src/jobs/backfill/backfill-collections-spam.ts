import { idb, ridb } from "@/common/db";

import { AbstractRabbitMqJobHandler } from "@/jobs/abstract-rabbit-mq-job-handler";
import { RabbitMQMessage } from "@/common/rabbit-mq";
import _ from "lodash";
import {
  ActionsLogContext,
  actionsLogJob,
  ActionsLogOrigin,
} from "@/jobs/general-tracking/actions-log-job";
import { logger } from "@/common/logger";
import { toBuffer } from "@/common/utils";

export type BackfillCollectionsSpamJobCursorInfo = {
  collectionId: string;
};

export class BackfillCollectionsSpamJob extends AbstractRabbitMqJobHandler {
  queueName = "backfill-collections-spam";
  maxRetries = 10;
  concurrency = 1;
  persistent = false;
  lazyMode = false;
  singleActiveConsumer = true;

  public async process(payload: BackfillCollectionsSpamJobCursorInfo) {
    const { collectionId } = payload;
    const values: {
      limit: number;
      collectionId?: string;
      excludeContracts?: Buffer[];
    } = {
      limit: 500,
      excludeContracts: [
        "0x3b3ee1931dc30c1957379fac9aba94d1c48a5405",
        "0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0",
        "0x41a322b28d0ff354040e2cbc676f0320d8c8850d",
      ].map(toBuffer),
    };

    let cursor = "";
    const newSpamState = 1;

    if (collectionId) {
      cursor = `AND id > $/collectionId/`;
      values.collectionId = collectionId;
    }

    logger.info(this.queueName, `start checking from ${collectionId}`);

    // Get verified collections
    const verifiedCollections = await idb.manyOrNone(
      `
        SELECT id, name
        FROM collections
        WHERE (metadata->>'safelistRequestStatus' = 'verified' OR metadata->>'magicedenVerificationStatus' = 'verified')
        AND contract NOT IN ($/excludeContracts:list/)
        ${cursor}
        ORDER BY collections.id
        LIMIT $/limit/
      `,
      values
    );

    if (verifiedCollections) {
      // Iterate the verified collections
      for (const verifiedCollection of verifiedCollections) {
        // Fetch any collections with similar name to a verified collections and are not verified
        const similarCollectionsQuery = `
          SELECT id, name
          FROM collections
          WHERE name ILIKE $/collectionName/
          AND id != $/collectionId/
          AND (metadata->>'safelistRequestStatus' != 'verified' OR metadata->>'safelistRequestStatus' IS NULL)
          AND (metadata->>'magicedenVerificationStatus' != 'verified' OR metadata->>'magicedenVerificationStatus' IS NULL)
          AND (is_spam IS NULL OR is_spam IN(0, -1))
        `;

        const similarCollectionsQueryResult = await ridb.manyOrNone(similarCollectionsQuery, {
          collectionId: verifiedCollection.id,
          collectionName: verifiedCollection.name,
        });

        if (similarCollectionsQueryResult) {
          // Mark the collections as spam
          for (const similarCollection of similarCollectionsQueryResult) {
            logger.info(
              this.queueName,
              `collection ${similarCollection.id} has similar name ${similarCollection.name} to a verified collection`
            );

            // Collection is spam update track and return
            await this.updateSpamStatus(similarCollection.id, newSpamState);

            // Track the change
            await actionsLogJob.addToQueue([
              {
                context: ActionsLogContext.SpamCollectionUpdate,
                origin: ActionsLogOrigin.VerifiedCollectionName,
                actionTakerIdentifier: this.queueName,
                collection: similarCollection.id,
                data: {
                  newSpamState,
                  collectionName: similarCollection.name,
                  verifiedCollectionName: verifiedCollection.name,
                  verifiedCollectionId: verifiedCollection.id,
                },
              },
            ]);
          }
        }
      }

      // Check if there are more potential users to sync
      if (verifiedCollections.length == values.limit) {
        const lastItem = _.last(verifiedCollections);

        return {
          addToQueue: true,
          cursor: { collectionId: lastItem.id },
        };
      }
    }

    return { addToQueue: false };
  }

  public async updateSpamStatus(collectionId: string, newSpamStatus: number) {
    return idb.none(
      `
      UPDATE collections
      SET is_spam = $/newSpamStatus/, updated_at = now()
      WHERE id = $/collectionId/
      AND (is_spam IS NULL OR is_spam = ${newSpamStatus > 0 ? "0" : "1"})
    `,
      {
        collectionId,
        newSpamStatus,
      }
    );
  }

  public async onCompleted(
    rabbitMqMessage: RabbitMQMessage,
    processResult: {
      addToQueue: boolean;
      cursor?: BackfillCollectionsSpamJobCursorInfo;
    }
  ) {
    if (processResult.addToQueue) {
      await this.addToQueue(processResult.cursor);
    }
  }

  public async addToQueue(cursor?: BackfillCollectionsSpamJobCursorInfo, delay = 0) {
    await this.send({ payload: cursor ?? {} }, delay);
  }
}

export const backfillCollectionsSpamJob = new BackfillCollectionsSpamJob();
