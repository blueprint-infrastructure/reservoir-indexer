/* eslint-disable @typescript-eslint/no-explicit-any */

import _ from "lodash";

import { idb, redb } from "@/common/db";
import {
  AttributeKeysEntity,
  AttributeKeysEntityParamsUpdateParams,
} from "@/models/attribute-keys/attribute-keys-entity";
import { toBuffer } from "@/common/utils";

export class AttributeKeys {
  public static async update(
    collectionId: string,
    key: string,
    fields: AttributeKeysEntityParamsUpdateParams
  ) {
    let updateString = "";
    const replacementValues = {
      collectionId,
      key,
    };

    _.forEach(fields, (value, fieldName) => {
      updateString += `${_.snakeCase(fieldName)} = $/${fieldName}/,`;
      (replacementValues as any)[fieldName] = value;
    });

    updateString = _.trimEnd(updateString, ",");

    const query = `UPDATE attribute_keys
                   SET updated_at = now(),
                       ${updateString}
                   WHERE collection_id = $/collectionId/
                   AND key = $/key/`;

    return await idb.none(query, replacementValues);
  }

  public static async delete(collectionId: string, key: string) {
    const replacementValues = {
      collectionId,
      key,
    };

    const query = `WITH x AS (
                    DELETE FROM attribute_keys
                    WHERE collection_id = $/collectionId/
                    AND key = $/key/
                    RETURNING id, collection_id, key, kind, rank, attribute_count, info, created_at
                   ) INSERT INTO removed_attribute_keys SELECT * FROM x;`;

    return await idb.none(query, replacementValues);
  }

  public static async getKeysCount(collectionId: string) {
    const query = `
        SELECT count(*) AS "count"
        FROM attribute_keys
        WHERE collection_id = $/collectionId/
    `;

    return (await redb.one(query, { collectionId })).count;
  }

  public static async getTokenAttributeKeys(
    contract: string,
    tokenId: string,
    kind: string | null = null
  ) {
    const query = `
      SELECT attribute_keys.*
      FROM token_attributes ta
      JOIN attributes ON ta.attribute_id = attributes.id
      JOIN attribute_keys ON attributes.attribute_key_id = attribute_keys.id
      WHERE ta.contract = $/contract/
      AND ta.token_id = $/tokenId/
      AND ta.key != ''
      ${kind ? `AND attribute_keys.kind = $/kind/` : ""}
    `;

    return (await redb.manyOrNone(query, {
      contract: toBuffer(contract),
      tokenId,
      kind,
    })) as AttributeKeysEntity[];
  }
}
