/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Boom from "@hapi/boom";
import { Request, RouteOptions } from "@hapi/hapi";
import Joi from "joi";

import { logger } from "@/common/logger";
import { config } from "@/config/index";
import { eventsSyncBackfillJob } from "@/jobs/events-sync/events-sync-backfill-job";
import { regex } from "@/common/utils";

export const postSyncEventsOptions: RouteOptions = {
  description: "Trigger syncing of events.",
  tags: ["api", "x-admin"],
  timeout: {
    server: 2 * 60 * 1000,
  },
  validate: {
    headers: Joi.object({
      "x-admin-api-key": Joi.string().required(),
    }).options({ allowUnknown: true }),
    payload: Joi.object({
      fromBlock: Joi.number().integer().positive().required(),
      toBlock: Joi.number().integer().positive().required(),
      // WARNING: Some events should always be fetched together!
      syncDetails: Joi.alternatives(
        Joi.object({
          method: Joi.string().valid("events"),
          events: Joi.array().items(Joi.string()),
          eventsType: Joi.array().items(Joi.string().valid("ftTransferEvents")),
        }).or("events", "eventsType"),
        Joi.object({
          method: Joi.string().valid("address"),
          address: Joi.string().pattern(regex.address),
        })
      ),
      blocksPerBatch: Joi.number().integer().positive().default(32),
      backfill: Joi.boolean().default(true),
      syncEventsOnly: Joi.boolean().default(true),
      skipTransactions: Joi.boolean().default(false),
      useArchiveRpcProvider: Joi.boolean().default(true),
      useBackfillRpcProvider: Joi.boolean()
        .default(false)
        .when("useArchiveRpcProvider", {
          is: true,
          then: Joi.valid(false),
          otherwise: Joi.valid(true, false),
        }),
    }),
  },
  handler: async (request: Request) => {
    if (request.headers["x-admin-api-key"] !== config.adminApiKey) {
      throw Boom.unauthorized("Wrong or missing admin API key");
    }

    const payload = request.payload as any;

    if (
      (config.genesisBlock && Number(payload.fromBlock) < config.genesisBlock) ||
      Number(payload.toBlock) < config.genesisBlock
    ) {
      throw Boom.badRequest(`Min block to sync ${config.genesisBlock}`);
    }

    try {
      const fromBlock = payload.fromBlock;
      const toBlock = payload.toBlock;
      const syncDetails = payload.syncDetails;
      const backfill = payload.backfill;
      const blocksPerBatch = payload.blocksPerBatch;
      const syncEventsOnly = payload.syncEventsOnly;
      const skipTransactions = payload.skipTransactions;
      const useArchiveRpcProvider = payload.useArchiveRpcProvider;
      const useBackfillRpcProvider = payload.useBackfillRpcProvider;

      // if (!syncEventsOnly && toBlock - fromBlock > 1000) {
      //   return {
      //     message: "Unsafe to trigger a large backfill request with `syncEventsOnly` disabled",
      //   };
      // }

      await eventsSyncBackfillJob.addToQueue(fromBlock, toBlock, {
        syncDetails,
        backfill,
        blocksPerBatch,
        syncEventsOnly,
        skipTransactions,
        useArchiveRpcProvider,
        useBackfillRpcProvider,
      });

      return { message: "Request accepted" };
    } catch (error) {
      logger.error("post-sync-events-handler", `Handler failure: ${error}`);
      throw error;
    }
  },
};
