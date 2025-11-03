import { Contract, utils } from "ethers";
import { baseProvider } from "@/common/provider";
import axios from "axios";
import { CollectionMetadata, TokenMetadata } from "@/metadata/types";

// This param indicate this is a shared contract logic that handles multiple collections sharing the same contract
export const isSharedContract = true;

export const extendCollection = async (metadata: CollectionMetadata, _tokenId: number) => {
  const nft = new Contract(
    metadata.contract,
    new utils.Interface([
      "function creatorOfToken(uint256 _tokenId) view returns (address)",
      "function tokenURI(uint256 tokenId) view returns (string)",
    ]),
    baseProvider
  );

  metadata.tokenIdRange = null;
  metadata.tokenSetId = null;

  const creatorAddress = await nft.creatorOfToken(_tokenId);

  let tokenURI = await nft.tokenURI(_tokenId);

  if (creatorAddress && tokenURI) {
    metadata.id = `${metadata.contract}:superrare-shared-${creatorAddress}`.toLowerCase();
    metadata.creator = creatorAddress;

    if (tokenURI && tokenURI.includes("ipfs://")) {
      tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    await axios
      .get(tokenURI)
      .then((rawMetadata) => {
        metadata.name = `SuperRare 1/1s: ${rawMetadata.data.createdBy}`;
      })
      .catch(() => {
        metadata.name = `SuperRare 1/1s: ${creatorAddress}`;
      });
    return {
      ...metadata,
    };
  }

  return metadata;
};

export const extend = async (metadata: TokenMetadata) => {
  const nft = new Contract(
    metadata.contract,
    new utils.Interface(["function creatorOfToken(uint256 _tokenId) view returns (address)"]),
    baseProvider
  );

  const creatorAddress = await nft.creatorOfToken(metadata.tokenId);

  if (creatorAddress) {
    metadata.collection = `${metadata.contract}:superrare-shared-${creatorAddress}`.toLowerCase();
    return {
      ...metadata,
    };
  }

  return metadata;
};
