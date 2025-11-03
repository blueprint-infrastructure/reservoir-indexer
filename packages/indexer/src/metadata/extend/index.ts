/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from "@/config/index";
import { CollectionMetadata, TokenMetadata } from "../types";
import * as adidasOriginals from "./adidas-originals";
import * as admitOne from "./admit-one";
import * as artTennis from "./art-tennis";
import * as artblocks from "./artblocks";
import * as artblocksEngine from "./artblocks-engine";
import * as asyncBlueprints from "./async-blueprints";
import * as bayc from "./bayc";
import * as boredApeKennelClub from "./bored-ape-kennel-club";
import * as boysOfSummer from "./boys-of-summer";
import * as brainDrops from "./braindrops";
import * as chimpers from "./chimpers";
import * as courtyard from "./courtyard";
import * as cryptokicksIrl from "./cryptokicks-irl";
import * as cyberkongz from "./cyberkongz";
import * as feralFile from "./feral-file";
import * as goldfinch from "./goldfinch";
import * as lilnouns from "./lilnouns";
import * as hape from "./hape";
import * as moonbirds from "./moonbirds";
import * as mutantApeYachtClub from "./mutant-ape-yacht-club";
import * as nouns from "./nouns";
import * as quantumArt from "./quantum-art";
import * as sharedContracts from "./shared-contracts";
import * as shreddingSassy from "./shredding-sassy";
import * as tfoust from "./tfoust";
import * as utopiaAvatars from "./utopia-avatars";
import * as superrareShared from "./superrare-shared";
import * as superrareShared850d from "./superrare-shared-850d";
import * as foundationShared from "./foundation-shared";
import * as kanpaiPandas from "./kanpai-pandas";
import * as zedRun from "./zed-run";
import * as punks2023 from "./punks2023";
import * as ens from "./ens";
import * as tokenUriExtend from "./token-uri-extend";

import { CollectionsOverride } from "@/models/collections-override";
import _ from "lodash";
import { logger } from "@/common/logger";
import { MetadataProvidersMap } from "@/metadata/providers";

const extendCollection: any = {};
const extend: any = {};
const extendTokenUriContracts: any = {};

export const hasExtendHandler = (contract: string) => extend[`${config.chainId},${contract}`];
export const hasExtendCollectionHandler = (contract: string) =>
  extendCollection[`${config.chainId},${contract}`];
export const hasExtendTokenUriHandler = (contract: string) =>
  extendTokenUriContracts[`${config.chainId},${contract}`];

export const isOpenseaSlugSharedContract = (contract: string) =>
  extendCollection[`${config.chainId},${contract}`]?.constructor?.name === "ExtendLogic";

export const isSharedContract = (contract: string) =>
  Boolean(extendCollection[`${config.chainId},${contract.toLowerCase()}`]?.isSharedContract);

export const extendCollectionMetadata = async (metadata: any, tokenId?: string) => {
  if (metadata) {
    if (extendCollection[`${config.chainId},${metadata.id}`]) {
      return extendCollection[`${config.chainId},${metadata.id}`].extendCollection(
        metadata,
        tokenId
      );
    } else {
      return metadata;
    }
  }
};

export const overrideCollectionMetadata = async (metadata: any) => {
  if (metadata) {
    const collectionsOverride = await CollectionsOverride.get(metadata.id);
    if (collectionsOverride) {
      return {
        ...metadata,
        ...collectionsOverride?.override,
        metadata: {
          ...metadata.metadata,
          ...collectionsOverride?.override?.metadata,
        },
      };
    }

    return metadata;
  }
};

export const extendMetadata = async (metadata: TokenMetadata) => {
  if (metadata) {
    if (extend[`${config.chainId},${metadata.contract.toLowerCase()}`]) {
      return extend[`${config.chainId},${metadata.contract.toLowerCase()}`].extend(metadata);
    } else {
      return metadata;
    }
  }
};

export const extendTokenUri = async (token: any, uri: string) =>
  extendTokenUriContracts[`${config.chainId},${token.contract}`].extendTokenUri(token, uri);

class ExtendLogic {
  public prefix: string;
  public isSharedContract = true;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  public async extendCollection(metadata: CollectionMetadata, _tokenId = null) {
    metadata.id = `${metadata.contract}:${this.prefix}-${metadata.slug}`;
    metadata.tokenIdRange = null;
    metadata.tokenSetId = null;

    return { ...metadata };
  }

  public async extend(metadata: TokenMetadata) {
    const slug = await this.getSlug(metadata.contract, metadata.tokenId);
    if (slug) {
      metadata.slug = slug;
    }

    metadata.collection = `${metadata.contract}:${this.prefix}-${metadata.slug}`;
    return { ...metadata };
  }

  public async getSlug(contract: string, tokenId: string) {
    try {
      const osMetadata = await MetadataProvidersMap["opensea"].getTokensMetadata([
        { contract: _.toLower(contract), tokenId },
      ]);

      if (osMetadata.length) {
        logger.info(
          "extend-logic",
          `fetched slug ${osMetadata[0].slug} for contract=${_.toLower(
            contract
          )}, tokenId=${tokenId}`
        );

        return osMetadata[0].slug;
      } else {
        logger.error(
          "extend-logic",
          `No metadata found with OS for contract=${_.toLower(contract)}, tokenId=${tokenId}`
        );
      }
    } catch (e) {
      logger.error(
        "extend-logic",
        `failed to get token metadata for contract=${_.toLower(
          contract
        )}, tokenId=${tokenId} error=${e}`
      );
    }

    return null;
  }
}

const ExtendLogicClasses = {
  opensea: new ExtendLogic("opensea"),
  courtyard: new ExtendLogic("courtyard"),
  feralfile: new ExtendLogic("feralfile"),
};

// Opensea Shared Contract
extendCollection["1,0x495f947276749ce646f68ac8c248420045cb7b5e"] = ExtendLogicClasses.opensea;
extendCollection["1,0x503a3039e9ce236e9a12e4008aecbb1fd8b384a3"] = ExtendLogicClasses.opensea;
extendCollection["1,0xd78afb925a21f87fa0e35abae2aead3f70ced96b"] = ExtendLogicClasses.opensea;
extendCollection["1,0xb6329bd2741c4e5e91e26c4e653db643e74b2b19"] = ExtendLogicClasses.opensea;
extendCollection["1,0xd8b7cc75e22031a72d7b8393113ef2536e17bde6"] = ExtendLogicClasses.opensea;
extendCollection["1,0x2d820afb710681580a55ca8077b57fba6dd9fd72"] = ExtendLogicClasses.opensea;
extendCollection["1,0x0faed6ddef3773f3ee5828383aaeeaca2a94564a"] = ExtendLogicClasses.opensea;
extendCollection["1,0x13927739076014913a3a7c207ef84c5be4780014"] = ExtendLogicClasses.opensea;
extendCollection["1,0x7a15b36cb834aea88553de69077d3777460d73ac"] = ExtendLogicClasses.opensea;
extendCollection["1,0x68d0f6d1d99bb830e17ffaa8adb5bbed9d6eec2e"] = ExtendLogicClasses.opensea;
extendCollection["1,0x33eecbf908478c10614626a9d304bfe18b78dd73"] = ExtendLogicClasses.opensea;
extendCollection["1,0x48b17a2c46007471b3eb72d16268eaecdd1502b7"] = ExtendLogicClasses.opensea;
extendCollection["1,0x069eeda3395242bd0d382e3ec5738704569b8885"] = ExtendLogicClasses.opensea;
extendCollection["1,0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c"] = ExtendLogicClasses.opensea;
extendCollection["1,0x466bec3a55a2a5831f3980c265581ad2dbf09ae6"] = ExtendLogicClasses.opensea;
extendCollection["1,0xabb3738f04dc2ec20f4ae4462c3d069d02ae045b"] = ExtendLogicClasses.opensea;
extendCollection["1,0xfbeef911dc5821886e1dda71586d90ed28174b7d"] = ExtendLogicClasses.opensea;
extendCollection["137,0x2953399124f0cbb46d2cbacd8a89cf0599974963"] = ExtendLogicClasses.opensea;

// Courtyard
extendCollection["1,0xd4ac3ce8e1e14cd60666d49ac34ff2d2937cf6fa"] = ExtendLogicClasses.courtyard;

// Feralfile
extendCollection["1,0x28b51ba8b990c48cb22cb6ef0ad5415fdba5210c"] = ExtendLogicClasses.feralfile;

// CyberKongz
extendCollection["1,0x57a204aa1042f6e66dd7730813f4024114d74f37"] = cyberkongz;

// Admit One
extendCollection["1,0xd2a077ec359d94e0a0b7e84435eacb40a67a817c"] = admitOne;
extendCollection["4,0xa7d49d78ab0295ad5a857dc4d0ab16445663ab85"] = admitOne;

// Art Tennis
extendCollection["1,0x4d928ab507bf633dd8e68024a1fb4c99316bbdf3"] = artTennis;

// Rarible ERC721
extendCollection["1,0xc9154424b823b10579895ccbe442d41b9abd96ed"] = sharedContracts;
extendCollection["5,0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"] = sharedContracts;

// Rarible ERC1155
extendCollection["1,0xb66a603f4cfe17e3d27b87a8bfcad319856518b8"] = sharedContracts;
extendCollection["5,0x7c4b13b5893cd82f371c5e28f12fb2f37542bbc5"] = sharedContracts;

// Zora
extendCollection["1,0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7"] = sharedContracts;

// Feral File
extendCollection["1,0x2a86c5466f088caebf94e071a77669bae371cd87"] = feralFile;

// BrainDrops
extendCollection["1,0xdfde78d2baec499fe18f2be74b6c287eed9511d7"] = brainDrops;

// Quantum Art
extendCollection["1,0x46ac8540d698167fcbb9e846511beb8cf8af9bd8"] = quantumArt;

// ArtBlocks
extendCollection["1,0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"] = artblocks;
extendCollection["1,0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"] = artblocks;
extendCollection["1,0x99a9b7c1116f9ceeb1652de04d5969cce509b069"] = artblocks;
extendCollection["5,0xda62f67be7194775a75be91cbf9feedcc5776d4b"] = artblocks;
extendCollection["5,0xb614c578062a62714c927cd8193f0b8bfb90055c"] = artblocks;

// ArtBlocks Engine
extendCollection["5,0xe480a895de49b49e37a8f0a8bd7e07fc9844cdb9"] = artblocksEngine;
extendCollection["11155111,0x6ceab51fc8ee931df84d3db66e747b617eb7de21"] = artblocksEngine;
extendCollection["11155111,0x000000008d4a636c2b3a157cd7a2142fe7f5688d"] = artblocksEngine;
extendCollection["11155111,0xec5dae4b11213290b2dbe5295093f75920bd2982"] = artblocksEngine;

extendCollection["1,0xbdde08bd57e5c9fd563ee7ac61618cb2ecdc0ce0"] = artblocksEngine;
extendCollection["1,0x28f2d3805652fb5d359486dffb7d08320d403240"] = artblocksEngine;
extendCollection["1,0x64780ce53f6e966e18a22af13a2f97369580ec11"] = artblocksEngine;
extendCollection["1,0x010be6545e14f1dc50256286d9920e833f809c6a"] = artblocksEngine;
extendCollection["1,0x13aae6f9599880edbb7d144bb13f1212cee99533"] = artblocksEngine;
extendCollection["1,0xa319c382a702682129fcbf55d514e61a16f97f9c"] = artblocksEngine;
extendCollection["1,0xd10e3dee203579fcee90ed7d0bdd8086f7e53beb"] = artblocksEngine;
extendCollection["1,0x62e37f664b5945629b6549a87f8e10ed0b6d923b"] = artblocksEngine;
extendCollection["1,0x0a1bbd57033f57e7b6743621b79fcb9eb2ce3676"] = artblocksEngine;
extendCollection["1,0x942bc2d3e7a589fe5bd4a5c6ef9727dfd82f5c8a"] = artblocksEngine;
extendCollection["1,0x32d4be5ee74376e08038d652d4dc26e62c67f436"] = artblocksEngine;
extendCollection["1,0xea698596b6009a622c3ed00dd5a8b5d1cae4fc36"] = artblocksEngine;
extendCollection["1,0x8cdbd7010bd197848e95c1fd7f6e870aac9b0d3c"] = artblocksEngine;
extendCollection["1,0xaf40b66072fe00cacf5a25cd1b7f1688cde20f2f"] = artblocksEngine;
extendCollection["1,0x294fed5f1d3d30cfa6fe86a937dc3141eec8bc6d"] = artblocksEngine;
extendCollection["1,0x7c3ea2b7b3befa1115ab51c09f0c9f245c500b18"] = artblocksEngine;
extendCollection["1,0x96a83b48de94e130cf2aa81b28391c28ee33d253"] = artblocksEngine;
extendCollection["1,0x9209070e1447018638e15b73dbee46bf085fcf5f"] = artblocksEngine;
extendCollection["1,0xe034bb2b1b9471e11cf1a0a9199a156fb227aa5d"] = artblocksEngine;
extendCollection["1,0x40cf4005847589bb8952ae3185dce03fdf0f2e2f"] = artblocksEngine;
extendCollection["1,0xab949cb7d6f267fbd6bc75796c6d11b785ece68f"] = artblocksEngine;
extendCollection["1,0x5fdf5e6caf7b8b0f64c3612afd85e9407a7e1389"] = artblocksEngine;
extendCollection["1,0xd00495689d5161c511882364e0c342e12dcc5f08"] = artblocksEngine;
extendCollection["1,0xd9b7ec74c06c558a59afde6a16e614950730f44d"] = artblocksEngine;
extendCollection["1,0x294fed5f1d3d30cfa6fe86a937dc3141eec8bc6d"] = artblocksEngine;
extendCollection["1,0xc74ec888104842277fa1b74e1c3d415eb673009f"] = artblocksEngine;
extendCollection["1,0x145789247973c5d612bf121e9e4eef84b63eb707"] = artblocksEngine;
extendCollection["1,0xea698596b6009a622c3ed00dd5a8b5d1cae4fc36"] = artblocksEngine;
extendCollection["1,0x18de6097ce5b5b2724c9cae6ac519917f3f178c0"] = artblocksEngine;
extendCollection["1,0x84f12b499f050cb612403c75d9f2777a5995fe17"] = artblocksEngine;
extendCollection["1,0xeafe7b73a3cfa804b761debcf077d4574588dfe7"] = artblocksEngine;
extendCollection["1,0xc443588d22fb0f8dab928e52014cc23d2df70743"] = artblocksEngine;
extendCollection["1,0x6ddefe5db20d79ec718a8960177beb388f7ebb8d"] = artblocksEngine;
extendCollection["1,0x764eb084a2b2e88cc625961e921aad5026a618ba"] = artblocksEngine;
extendCollection["1,0x8cdbd7010bd197848e95c1fd7f6e870aac9b0d3c"] = artblocksEngine;
extendCollection["1,0x959d2f3caf19d20bdbb4e0a4f21ca8a815eddf65"] = artblocksEngine;
extendCollection["1,0x31a1bfb7ad3e3e6198d7a50012a4213594875d14"] = artblocksEngine;
extendCollection["1,0x324bc45c9f257f177166be4f6e7d2f551b5a1f03"] = artblocksEngine;
extendCollection["1,0x4ae867912a3d8e74e063516242ab6a7273f38cf9"] = artblocksEngine;
extendCollection["1,0xaf40b66072fe00cacf5a25cd1b7f1688cde20f2f"] = artblocksEngine;
extendCollection["1,0xa86cd4ecebd96085fce4697614d30600803455c4"] = artblocksEngine;
extendCollection["1,0xedd5c3d8e8fc1e88b93a98282b8ccfd953c483a4"] = artblocksEngine;
extendCollection["1,0x1353fd9d3dc70d1a18149c8fb2adb4fb906de4e8"] = artblocksEngine;
extendCollection["1,0x9f79e46a309f804aa4b7b53a1f72c69137427794"] = artblocksEngine;
extendCollection["1,0x99a9b7c1116f9ceeb1652de04d5969cce509b069"] = artblocksEngine;
extendCollection["1,0x942bc2d3e7a589fe5bd4a5c6ef9727dfd82f5c8a"] = artblocksEngine;
extendCollection["1,0x77d4b54e91822e9799ab0900876d6b1cda752706"] = artblocksEngine;
extendCollection["1,0xf03511ec774289da497cdb2070df4c711580ff7a"] = artblocksEngine;
extendCollection["1,0x5d8efdc20272cd3e24a27dfe7f25795a107c99a2"] = artblocksEngine;
extendCollection["1,0x440e1b5a98332bca7564dbffa4146f976ce75397"] = artblocksEngine;
extendCollection["1,0xea46ca9eaf449b8c16305887f66019e9b1c72392"] = artblocksEngine;
extendCollection["1,0xac521ea7a83a3bc3f9f1e09f8300a6301743fb1f"] = artblocksEngine;
extendCollection["1,0x4982d9a890bb286a0664a8af3b896be8403dcca4"] = artblocksEngine;
extendCollection["1,0xb8e8bec0891a7519091e18590e0b60221853dd2b"] = artblocksEngine;
extendCollection["1,0x96a83b48de94e130cf2aa81b28391c28ee33d253"] = artblocksEngine;
extendCollection["1,0xe18f2247fe4a69c0e2210331b0604f6d10fece9e"] = artblocksEngine;
extendCollection["1,0x381233d5584fdb42e46b4d9ba91876479aab7acd"] = artblocksEngine;
extendCollection["1,0x5306e34b7437200e0189cbc5f80b0990e49dcbe7"] = artblocksEngine;
extendCollection["1,0x0000000c687f0226eaf0bdb39104fad56738cdf2"] = artblocksEngine;
extendCollection["1,0x0000000b0a4340083afba8b0b71cbcd80432cf2c"] = artblocksEngine;
extendCollection["1,0x0000000a77593cda3f3434454ae534163fe1a431"] = artblocksEngine;
extendCollection["1,0x000000058b5d9e705ee989fabc8dfdc1bfbdfa6b"] = artblocksEngine;
extendCollection["1,0x0000000826d45c6b947d485eeb8322acccad8ddb"] = artblocksEngine;
extendCollection["1,0x000000098a14b4e08132fd55faec521ab597a001"] = artblocksEngine;
extendCollection["1,0x0000000ecb73d12be8ba8bda2875fdbce332ea5c"] = artblocksEngine;
extendCollection["1,0x000000c356f75bb84e4a0032740291fe6d4cba95"] = artblocksEngine;
extendCollection["1,0x00000007cc35dcab4a396249aefa295a8b6e16ba"] = artblocksEngine;
extendCollection["1,0x00000008a4f78d6941786e7fb09fb59a62cde226"] = artblocksEngine;
extendCollection["1,0x000009bb1740eea484f7db00000a9227e578bf96"] = artblocksEngine;
extendCollection["1,0x000010efe35a97f37fcdfd00fd20006e5228650a"] = artblocksEngine;
extendCollection["1,0x000000a6e6366baf7c98a2ab73d3df1092dd7bb0"] = artblocksEngine;
extendCollection["1,0x0000000b79eba5ae9327d9b802ac778a67e5c156"] = artblocksEngine;
extendCollection["1,0x000000cb8bad52b0d51f4190dd1c62ce1cde1e9d"] = artblocksEngine;
extendCollection["1,0x000000d016f74fc6af2506ac4c1d984d9cfd65f2"] = artblocksEngine;
extendCollection["1,0x000000e0808eae91ad4d81d2789b8caf89747b61"] = artblocksEngine;
extendCollection["1,0x000000ff2fbc55b982010b42e235cc2a0ce3250b"] = artblocksEngine;
extendCollection["1,0x00000003550505f51d314091f496d30a2b50ff90"] = artblocksEngine;
extendCollection["1,0x0000018afa7ca51648ed4b2b00c133005ea17115"] = artblocksEngine;
extendCollection["1,0x70d16554e815859f7ba722cb4fa8a837378d400d"] = artblocksEngine;
extendCollection["1,0x000000412217f67742376769695498074f007b97"] = artblocksEngine;
extendCollection["1,0x1725dc55c1bd5200bf00566cf20000b10800c68e"] = artblocksEngine;
extendCollection["1,0x9800005deb3cfaf80077dbe9b9004c0020c1d6c5"] = artblocksEngine;
extendCollection["1,0xd40030fd1d00f1a9944462ff0025e9c8d0003500"] = artblocksEngine;
extendCollection["1,0xa73300003e020c436a67809e9300301600013000"] = artblocksEngine;
extendCollection["1,0xc3cfc7000084f5987800f024571236000a010022"] = artblocksEngine;
extendCollection["1,0xdd6800ac7a54331b00000080bbd1ef463475005b"] = artblocksEngine;
extendCollection["1,0x5e581e596e9951bb00246e00a70030009b620054"] = artblocksEngine;
extendCollection["1,0x000000a4c880377d53f66dc721b147b0b34700c7"] = artblocksEngine;
extendCollection["1,0x000000d1dc20af3f7746dc61a4718edce700ced8"] = artblocksEngine;
extendCollection["1,0x45e94b8c6087775c0074003b0056deec41008f00"] = artblocksEngine;
extendCollection["1,0xf3cc21a4009093b45b5d005ce7a0a80000580056"] = artblocksEngine;
extendCollection["1,0x0c3eb61e00400c3f1f1cc9002700a90020f05e00"] = artblocksEngine;
extendCollection["1,0x8db6f700a7c90000f92ac90084ad93a500f1eae0"] = artblocksEngine;
extendCollection["1,0xb3526a6400260078517643cfd8490078803e0000"] = artblocksEngine;
extendCollection["1,0xab0000000000aa06f89b268d604a9c1c41524ac6"] = artblocksEngine;
extendCollection["1,0x0000003601ae3f24a52323705fb36b8833071fd3"] = artblocksEngine;
extendCollection["1,0x000000eabb383dd7c899343ac2b47fe65ea18fcf"] = artblocksEngine;
extendCollection["1,0x00000049ba17f5dc58818a6f644d25a96661327b"] = artblocksEngine;
extendCollection["1,0x00000038610bc4c96ef657aa1bcb8902ae65c62a"] = artblocksEngine;
extendCollection["1,0x0000009e3a0433ad9e9b3756b4120dd86949e2a0"] = artblocksEngine;
extendCollection["1,0x000000ec5a4564898f38c0af11cb5b0be5533832"] = artblocksEngine;
extendCollection["1,0x000000adf65e202866a4a405ae9629e12a039a62"] = artblocksEngine;
extendCollection["1,0x000000365ed3c9d1babc165c966992a6f5ecabf2"] = artblocksEngine;
extendCollection["1,0x0000652240c8c945067775d290641000594d0090"] = artblocksEngine;
extendCollection["1,0x0000186a8ba59c7f63423b0e528e384000008ac9"] = artblocksEngine;
extendCollection["1,0x0000009e962e6b00604d06e0bdd2cde0678cc89e"] = artblocksEngine;
extendCollection["1,0x00007bb2005fdd5774f78985e20040e2b1b99d07"] = artblocksEngine;
extendCollection["1,0x0000b82f38e839152b8f97487300263e0eae00f7"] = artblocksEngine;
extendCollection["1,0x0000004f5c5a4390738b7dd9b662e95e44bf5bb7"] = artblocksEngine;
extendCollection["1,0x00000599ba06d628daea74610094610027cca9b8"] = artblocksEngine;
extendCollection["1,0x000000c3f849598a2e08150f91b1f54193d316e9"] = artblocksEngine;
extendCollection["1,0x000000e6d2c9b681e3fd3c36590d5a2e1c56f4bc"] = artblocksEngine;
extendCollection["1,0x0000a540c5b0b2b17100d63d8d066b00343020bb"] = artblocksEngine;
extendCollection["1,0x0000f6bc84ab98fbd8fce1f6d047965c723f0000"] = artblocksEngine;
extendCollection["1,0x0000149485af7433f8da00419b931100d4aaef42"] = artblocksEngine;
extendCollection["1,0x000023566874e414ef00008c5025782d0a9a3783"] = artblocksEngine;
extendCollection["1,0x0000001590abfb45b052c28fb7dac11c062b9337"] = artblocksEngine;
extendCollection["1,0x0000b52017e1ec58f64171b6001518c07a9aec00"] = artblocksEngine;
extendCollection["1,0x000000b862836c9bbae6cca68a0a2fe5ce497823"] = artblocksEngine;
extendCollection["1,0x000000a35301fa5784e820f489003ffcffdc69a6"] = artblocksEngine;
extendCollection["1,0x0000ec0076f0687e399b8d00570cdc70657e4101"] = artblocksEngine;
extendCollection["1,0x00000058642a13e644fa1571106e3d5e7580d491"] = artblocksEngine;
extendCollection["1,0x000071ce00590014b26c63e039403fa1197cc446"] = artblocksEngine;
extendCollection["1,0x000000606ee90cb15464eaba7c4028b549def16c"] = artblocksEngine;
extendCollection["1,0xa06db200f4b6000000614704a68423a358005be7"] = artblocksEngine;
extendCollection["1,0x000062aeea7af9b200d1b0a41c6e00c0c27e92ff"] = artblocksEngine;
extendCollection["1,0x000000637fddcdd459b047897afb3ea46aa6f334"] = artblocksEngine;
extendCollection["1,0x00000064c65bd96db98840d52b637136a520592e"] = artblocksEngine;
extendCollection["1,0x000000654283cd976221b0e8358999591018cf1b"] = artblocksEngine;
extendCollection["1,0x0000006693e685fcfc54c9d423b5e321b4a15192"] = artblocksEngine;
extendCollection["1,0x0000067b003116628bf6b300ecef8e42663a32c4"] = artblocksEngine;
extendCollection["1,0x00000000e75eadc620f4fcefab32f5173749c3a4"] = artblocksEngine;
extendCollection["1,0x0000000f2927d885e7be55da01cc4c6d5da6b1ba"] = artblocksEngine;
extendCollection["1,0xc04e0000726ed7c5b9f0045bc0c4806321bc6c65"] = artblocksEngine;
extendCollection["1,0x68c01cb4733a82a58d5e7bb31bddbff26a3a35d5"] = artblocksEngine;
extendCollection["1,0x010be6545e14f1dc50256286d9920e833f809c6a"] = artblocksEngine;
extendCollection["1,0x64780ce53f6e966e18a22af13a2f97369580ec11"] = artblocksEngine;
extendCollection["1,0xbb5471c292065d3b01b2e81e299267221ae9a250"] = artblocksEngine;
extendCollection["1,0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"] = artblocksEngine;
extendCollection["1,0x0a1bbd57033f57e7b6743621b79fcb9eb2ce3676"] = artblocksEngine;
extendCollection["1,0x2b3c48be4fb33b0724214aff12b086b0214f8f15"] = artblocksEngine;
extendCollection["1,0x1d0977e86c70eabb5c8fd98db1b08c6d60caa0c1"] = artblocksEngine;
extendCollection["1,0x28f2d3805652fb5d359486dffb7d08320d403240"] = artblocksEngine;
extendCollection["1,0x4d928ab507bf633dd8e68024a1fb4c99316bbdf3"] = artblocksEngine;
extendCollection["1,0x13aae6f9599880edbb7d144bb13f1212cee99533"] = artblocksEngine;
extendCollection["1,0x54a6356244059d5a50b97200a928f19a3682b669"] = artblocksEngine;
extendCollection["1,0x32d4be5ee74376e08038d652d4dc26e62c67f436"] = artblocksEngine;
extendCollection["1,0x62e37f664b5945629b6549a87f8e10ed0b6d923b"] = artblocksEngine;
extendCollection["1,0x67c0b53c8448a10f0eface978fc5be9892f33a2c"] = artblocksEngine;
extendCollection["1,0x73b4797e2fd04fa42a9f3c9bcfbcee19374a9060"] = artblocksEngine;
extendCollection["1,0x7c3ea2b7b3befa1115ab51c09f0c9f245c500b18"] = artblocksEngine;
extendCollection["1,0xbdde08bd57e5c9fd563ee7ac61618cb2ecdc0ce0"] = artblocksEngine;
extendCollection["1,0xa319c382a702682129fcbf55d514e61a16f97f9c"] = artblocksEngine;
extendCollection["1,0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"] = artblocksEngine;
extendCollection["1,0xd10e3dee203579fcee90ed7d0bdd8086f7e53beb"] = artblocksEngine;
extendCollection["1,0xff124d975c7792e706552b18ec9da24781751cab"] = artblocksEngine;
extendCollection["42161,0x47a91457a3a1f700097199fd63c039c4784384ab"] = artblocksEngine;
extendCollection["42161,0x7497909537ce00fdda93c12d5083d8647c593c67"] = artblocksEngine;
extendCollection["42161,0xd1d1222f6d3e4f64db1c025ecd0b314db8449ac4"] = artblocksEngine;
extendCollection["42161,0x0d39ab55664007ff2d089a25480f169c6d0597bb"] = artblocksEngine;
extendCollection["42161,0xd168b708a5385a1cb50cf13f5fbd63149ccc08ab"] = artblocksEngine;
extendCollection["42161,0x8c2111b174fb454fdac4673defa82cbe337ae706"] = artblocksEngine;
extendCollection["42161,0xfb2fc7ee917fb2fa0ab25542fa2e3e1351df5523"] = artblocksEngine;
extendCollection["42161,0x0000000fae63d15270aafe9e08a71cd28079572d"] = artblocksEngine;
extendCollection["42161,0x0000000098ddf2a817189a189a7254c4d16e0ab7"] = artblocksEngine;
extendCollection["8453,0xa39abc16d7b6cfbf2cb1d02de65a0b28101cdad1"] = artblocksEngine;
extendCollection["8453,0x0061b590a42433392bc76b3f3fe1404a5df449c9"] = artblocksEngine;
extendCollection["8453,0x0000000080d04343d60d06e1a36aaf46c9242805"] = artblocksEngine;
extendCollection["8453,0x0000005cb45d63e973d9bf3ea82d35fff6dc5b38"] = artblocksEngine;
extendCollection["8453,0x000000059b9f7949a6427fd556cce376f84be656"] = artblocksEngine;

// Async Blueprints
extendCollection["1,0xc143bbfcdbdbed6d454803804752a064a622c1f3"] = asyncBlueprints;

// Mirage Gallery Curated
// extendCollection["1,0xb7ec7bbd2d2193b47027247fc666fb342d23c4b5"] = mirageGalleryCurated;

// Superrare Shared
extendCollection["1,0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0"] = superrareShared;
extendCollection["1,0x41a322b28d0ff354040e2cbc676f0320d8c8850d"] = superrareShared850d;

// Foundation
extendCollection["1,0x3b3ee1931dc30c1957379fac9aba94d1c48a5405"] = foundationShared;

// Opensea Shared Contract
extend["1,0x495f947276749ce646f68ac8c248420045cb7b5e"] = ExtendLogicClasses.opensea;
extend["1,0x503a3039e9ce236e9a12e4008aecbb1fd8b384a3"] = ExtendLogicClasses.opensea;
extend["1,0xd78afb925a21f87fa0e35abae2aead3f70ced96b"] = ExtendLogicClasses.opensea;
extend["1,0xb6329bd2741c4e5e91e26c4e653db643e74b2b19"] = ExtendLogicClasses.opensea;
extend["1,0xd8b7cc75e22031a72d7b8393113ef2536e17bde6"] = ExtendLogicClasses.opensea;
extend["1,0x2d820afb710681580a55ca8077b57fba6dd9fd72"] = ExtendLogicClasses.opensea;
extend["1,0x0faed6ddef3773f3ee5828383aaeeaca2a94564a"] = ExtendLogicClasses.opensea;
extend["1,0x13927739076014913a3a7c207ef84c5be4780014"] = ExtendLogicClasses.opensea;
extend["1,0x7a15b36cb834aea88553de69077d3777460d73ac"] = ExtendLogicClasses.opensea;
extend["1,0x68d0f6d1d99bb830e17ffaa8adb5bbed9d6eec2e"] = ExtendLogicClasses.opensea;
extend["1,0x33eecbf908478c10614626a9d304bfe18b78dd73"] = ExtendLogicClasses.opensea;
extend["1,0x48b17a2c46007471b3eb72d16268eaecdd1502b7"] = ExtendLogicClasses.opensea;
extend["1,0x069eeda3395242bd0d382e3ec5738704569b8885"] = ExtendLogicClasses.opensea;
extend["1,0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c"] = ExtendLogicClasses.opensea;
extend["1,0x466bec3a55a2a5831f3980c265581ad2dbf09ae6"] = ExtendLogicClasses.opensea;
extend["1,0xabb3738f04dc2ec20f4ae4462c3d069d02ae045b"] = ExtendLogicClasses.opensea;
extend["1,0xfbeef911dc5821886e1dda71586d90ed28174b7d"] = ExtendLogicClasses.opensea;
extend["137,0x2953399124f0cbb46d2cbacd8a89cf0599974963"] = ExtendLogicClasses.opensea;

// Courtyard
extend["1,0xd4ac3ce8e1e14cd60666d49ac34ff2d2937cf6fa"] = courtyard;

// Feralfile
extend["1,0x28b51ba8b990c48cb22cb6ef0ad5415fdba5210c"] = ExtendLogicClasses.feralfile;

// CyberKongz
extend["1,0x57a204aa1042f6e66dd7730813f4024114d74f37"] = cyberkongz;

// Adidas Originals
extend["1,0x28472a58a490c5e09a238847f66a68a47cc76f0f"] = adidasOriginals;

// Mutant Ape Yacht Club
extend["1,0x60e4d786628fea6478f785a6d7e704777c86a7c6"] = mutantApeYachtClub;

// Bored Ape Kennel Club
extend["1,0xba30e5f9bb24caa003e9f2f0497ad287fdf95623"] = boredApeKennelClub;

// Bored Ape Yacht Club
extend["1,0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"] = bayc;

// Nouns
extend["1,0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03"] = nouns;
extend["1,0x4b10701bfd7bfedc47d50562b76b436fbb5bdb3b"] = lilnouns;

// Chimpers
extend["1,0x80336ad7a747236ef41f47ed2c7641828a480baa"] = chimpers;

// Moonbirds
extend["1,0x23581767a106ae21c074b2276d25e5c3e136a68b"] = moonbirds;

// Async Blueprints
extend["1,0xc143bbfcdbdbed6d454803804752a064a622c1f3"] = asyncBlueprints;

// tfoust
tfoust.CollectiblesCollections.forEach((c) => (extend[`137,${c}`] = tfoust));

// Feral File
extend["1,0x2a86c5466f088caebf94e071a77669bae371cd87"] = feralFile;

// Boys of Summer
extend["5,0x7ba399e03ca7598b2e6d56ba97961282edc9ad65"] = boysOfSummer;
// BrainDrops
extend["1,0xdfde78d2baec499fe18f2be74b6c287eed9511d7"] = brainDrops;

// Quantum Art
extend["1,0x46ac8540d698167fcbb9e846511beb8cf8af9bd8"] = quantumArt;

// Shredding Sassy
extend["1,0x165BD6E2ae984D9C13D94808e9A6ba2b7348c800"] = shreddingSassy;

// ArtBlocks
extend["1,0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"] = artblocks;
extend["1,0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"] = artblocks;
extend["1,0x99a9b7c1116f9ceeb1652de04d5969cce509b069"] = artblocks;
extend["5,0xda62f67be7194775a75be91cbf9feedcc5776d4b"] = artblocks;
extend["5,0xb614c578062a62714c927cd8193f0b8bfb90055c"] = artblocks;

// ArtBlocks Engine
extend["1,0xbdde08bd57e5c9fd563ee7ac61618cb2ecdc0ce0"] = artblocksEngine;
extend["1,0x28f2d3805652fb5d359486dffb7d08320d403240"] = artblocksEngine;
extend["1,0x64780ce53f6e966e18a22af13a2f97369580ec11"] = artblocksEngine;
extend["1,0x010be6545e14f1dc50256286d9920e833f809c6a"] = artblocksEngine;
extend["1,0x13aae6f9599880edbb7d144bb13f1212cee99533"] = artblocksEngine;
extend["1,0xa319c382a702682129fcbf55d514e61a16f97f9c"] = artblocksEngine;
extend["1,0xd10e3dee203579fcee90ed7d0bdd8086f7e53beb"] = artblocksEngine;
extend["1,0x62e37f664b5945629b6549a87f8e10ed0b6d923b"] = artblocksEngine;
extend["1,0x0a1bbd57033f57e7b6743621b79fcb9eb2ce3676"] = artblocksEngine;
extend["1,0x942bc2d3e7a589fe5bd4a5c6ef9727dfd82f5c8a"] = artblocksEngine;
extend["1,0x32d4be5ee74376e08038d652d4dc26e62c67f436"] = artblocksEngine;
extend["1,0xea698596b6009a622c3ed00dd5a8b5d1cae4fc36"] = artblocksEngine;
extend["1,0x8cdbd7010bd197848e95c1fd7f6e870aac9b0d3c"] = artblocksEngine;
extend["1,0xaf40b66072fe00cacf5a25cd1b7f1688cde20f2f"] = artblocksEngine;
extend["1,0x294fed5f1d3d30cfa6fe86a937dc3141eec8bc6d"] = artblocksEngine;
extend["1,0x7c3ea2b7b3befa1115ab51c09f0c9f245c500b18"] = artblocksEngine;
extend["1,0x96a83b48de94e130cf2aa81b28391c28ee33d253"] = artblocksEngine;
extend["5,0xe480a895de49b49e37a8f0a8bd7e07fc9844cdb9"] = artblocksEngine;
extend["42161,0x47a91457a3a1f700097199fd63c039c4784384ab"] = artblocksEngine;
extend["11155111,0x6ceab51fc8ee931df84d3db66e747b617eb7de21"] = artblocksEngine;
extend["11155111,0x000000008d4a636c2b3a157cd7a2142fe7f5688d"] = artblocksEngine;
extend["11155111,0xec5dae4b11213290b2dbe5295093f75920bd2982"] = artblocksEngine;

extend["1,0x9209070e1447018638e15b73dbee46bf085fcf5f"] = artblocksEngine;
extend["1,0xe034bb2b1b9471e11cf1a0a9199a156fb227aa5d"] = artblocksEngine;
extend["1,0x40cf4005847589bb8952ae3185dce03fdf0f2e2f"] = artblocksEngine;
extend["1,0xab949cb7d6f267fbd6bc75796c6d11b785ece68f"] = artblocksEngine;
extend["1,0x5fdf5e6caf7b8b0f64c3612afd85e9407a7e1389"] = artblocksEngine;
extend["1,0xd00495689d5161c511882364e0c342e12dcc5f08"] = artblocksEngine;
extend["1,0xd9b7ec74c06c558a59afde6a16e614950730f44d"] = artblocksEngine;
extend["1,0x294fed5f1d3d30cfa6fe86a937dc3141eec8bc6d"] = artblocksEngine;
extend["1,0xc74ec888104842277fa1b74e1c3d415eb673009f"] = artblocksEngine;
extend["1,0x145789247973c5d612bf121e9e4eef84b63eb707"] = artblocksEngine;
extend["1,0xea698596b6009a622c3ed00dd5a8b5d1cae4fc36"] = artblocksEngine;
extend["1,0x18de6097ce5b5b2724c9cae6ac519917f3f178c0"] = artblocksEngine;
extend["1,0x84f12b499f050cb612403c75d9f2777a5995fe17"] = artblocksEngine;
extend["1,0xeafe7b73a3cfa804b761debcf077d4574588dfe7"] = artblocksEngine;
extend["1,0xc443588d22fb0f8dab928e52014cc23d2df70743"] = artblocksEngine;
extend["1,0x6ddefe5db20d79ec718a8960177beb388f7ebb8d"] = artblocksEngine;
extend["1,0x764eb084a2b2e88cc625961e921aad5026a618ba"] = artblocksEngine;
extend["1,0x8cdbd7010bd197848e95c1fd7f6e870aac9b0d3c"] = artblocksEngine;
extend["1,0x959d2f3caf19d20bdbb4e0a4f21ca8a815eddf65"] = artblocksEngine;
extend["1,0x31a1bfb7ad3e3e6198d7a50012a4213594875d14"] = artblocksEngine;
extend["1,0x324bc45c9f257f177166be4f6e7d2f551b5a1f03"] = artblocksEngine;
extend["1,0x4ae867912a3d8e74e063516242ab6a7273f38cf9"] = artblocksEngine;
extend["1,0xaf40b66072fe00cacf5a25cd1b7f1688cde20f2f"] = artblocksEngine;
extend["1,0xa86cd4ecebd96085fce4697614d30600803455c4"] = artblocksEngine;
extend["1,0xedd5c3d8e8fc1e88b93a98282b8ccfd953c483a4"] = artblocksEngine;
extend["1,0x1353fd9d3dc70d1a18149c8fb2adb4fb906de4e8"] = artblocksEngine;
extend["1,0x9f79e46a309f804aa4b7b53a1f72c69137427794"] = artblocksEngine;
extend["1,0x99a9b7c1116f9ceeb1652de04d5969cce509b069"] = artblocksEngine;
extend["1,0x942bc2d3e7a589fe5bd4a5c6ef9727dfd82f5c8a"] = artblocksEngine;
extend["1,0x77d4b54e91822e9799ab0900876d6b1cda752706"] = artblocksEngine;
extend["1,0xf03511ec774289da497cdb2070df4c711580ff7a"] = artblocksEngine;
extend["1,0x5d8efdc20272cd3e24a27dfe7f25795a107c99a2"] = artblocksEngine;
extend["1,0x440e1b5a98332bca7564dbffa4146f976ce75397"] = artblocksEngine;
extend["1,0xea46ca9eaf449b8c16305887f66019e9b1c72392"] = artblocksEngine;
extend["1,0xac521ea7a83a3bc3f9f1e09f8300a6301743fb1f"] = artblocksEngine;
extend["1,0x4982d9a890bb286a0664a8af3b896be8403dcca4"] = artblocksEngine;
extend["1,0xb8e8bec0891a7519091e18590e0b60221853dd2b"] = artblocksEngine;
extend["1,0x96a83b48de94e130cf2aa81b28391c28ee33d253"] = artblocksEngine;
extend["1,0xe18f2247fe4a69c0e2210331b0604f6d10fece9e"] = artblocksEngine;
extend["1,0x381233d5584fdb42e46b4d9ba91876479aab7acd"] = artblocksEngine;
extend["1,0x5306e34b7437200e0189cbc5f80b0990e49dcbe7"] = artblocksEngine;
extend["1,0x0000000c687f0226eaf0bdb39104fad56738cdf2"] = artblocksEngine;
extend["1,0x0000000b0a4340083afba8b0b71cbcd80432cf2c"] = artblocksEngine;
extend["1,0x0000000a77593cda3f3434454ae534163fe1a431"] = artblocksEngine;
extend["1,0x000000058b5d9e705ee989fabc8dfdc1bfbdfa6b"] = artblocksEngine;
extend["1,0x0000000826d45c6b947d485eeb8322acccad8ddb"] = artblocksEngine;
extend["1,0x000000098a14b4e08132fd55faec521ab597a001"] = artblocksEngine;
extend["1,0x0000000ecb73d12be8ba8bda2875fdbce332ea5c"] = artblocksEngine;
extend["1,0x000000c356f75bb84e4a0032740291fe6d4cba95"] = artblocksEngine;
extend["1,0x00000007cc35dcab4a396249aefa295a8b6e16ba"] = artblocksEngine;
extend["1,0x00000008a4f78d6941786e7fb09fb59a62cde226"] = artblocksEngine;
extend["1,0x000009bb1740eea484f7db00000a9227e578bf96"] = artblocksEngine;
extend["1,0x000010efe35a97f37fcdfd00fd20006e5228650a"] = artblocksEngine;
extend["1,0x000000a6e6366baf7c98a2ab73d3df1092dd7bb0"] = artblocksEngine;
extend["1,0x0000000b79eba5ae9327d9b802ac778a67e5c156"] = artblocksEngine;
extend["1,0x000000cb8bad52b0d51f4190dd1c62ce1cde1e9d"] = artblocksEngine;
extend["1,0x000000d016f74fc6af2506ac4c1d984d9cfd65f2"] = artblocksEngine;
extend["1,0x000000e0808eae91ad4d81d2789b8caf89747b61"] = artblocksEngine;
extend["1,0x000000ff2fbc55b982010b42e235cc2a0ce3250b"] = artblocksEngine;
extend["1,0x00000003550505f51d314091f496d30a2b50ff90"] = artblocksEngine;
extend["1,0x0000018afa7ca51648ed4b2b00c133005ea17115"] = artblocksEngine;
extend["1,0x70d16554e815859f7ba722cb4fa8a837378d400d"] = artblocksEngine;
extend["1,0x000000412217f67742376769695498074f007b97"] = artblocksEngine;
extend["1,0x1725dc55c1bd5200bf00566cf20000b10800c68e"] = artblocksEngine;
extend["1,0x9800005deb3cfaf80077dbe9b9004c0020c1d6c5"] = artblocksEngine;
extend["1,0xd40030fd1d00f1a9944462ff0025e9c8d0003500"] = artblocksEngine;
extend["1,0xa73300003e020c436a67809e9300301600013000"] = artblocksEngine;
extend["1,0xc3cfc7000084f5987800f024571236000a010022"] = artblocksEngine;
extend["1,0xdd6800ac7a54331b00000080bbd1ef463475005b"] = artblocksEngine;
extend["1,0x5e581e596e9951bb00246e00a70030009b620054"] = artblocksEngine;
extend["1,0x000000a4c880377d53f66dc721b147b0b34700c7"] = artblocksEngine;
extend["1,0x000000d1dc20af3f7746dc61a4718edce700ced8"] = artblocksEngine;
extend["1,0x45e94b8c6087775c0074003b0056deec41008f00"] = artblocksEngine;
extend["1,0xf3cc21a4009093b45b5d005ce7a0a80000580056"] = artblocksEngine;
extend["1,0x0c3eb61e00400c3f1f1cc9002700a90020f05e00"] = artblocksEngine;
extend["1,0x8db6f700a7c90000f92ac90084ad93a500f1eae0"] = artblocksEngine;
extend["1,0xb3526a6400260078517643cfd8490078803e0000"] = artblocksEngine;
extend["1,0xab0000000000aa06f89b268d604a9c1c41524ac6"] = artblocksEngine;
extend["1,0x0000003601ae3f24a52323705fb36b8833071fd3"] = artblocksEngine;
extend["1,0x000000eabb383dd7c899343ac2b47fe65ea18fcf"] = artblocksEngine;
extend["1,0x00000049ba17f5dc58818a6f644d25a96661327b"] = artblocksEngine;
extend["1,0x00000038610bc4c96ef657aa1bcb8902ae65c62a"] = artblocksEngine;
extend["1,0x0000009e3a0433ad9e9b3756b4120dd86949e2a0"] = artblocksEngine;
extend["1,0x000000ec5a4564898f38c0af11cb5b0be5533832"] = artblocksEngine;
extend["1,0x000000adf65e202866a4a405ae9629e12a039a62"] = artblocksEngine;
extend["1,0x000000365ed3c9d1babc165c966992a6f5ecabf2"] = artblocksEngine;
extend["1,0x0000652240c8c945067775d290641000594d0090"] = artblocksEngine;
extend["1,0x0000186a8ba59c7f63423b0e528e384000008ac9"] = artblocksEngine;
extend["1,0x0000009e962e6b00604d06e0bdd2cde0678cc89e"] = artblocksEngine;
extend["1,0x00007bb2005fdd5774f78985e20040e2b1b99d07"] = artblocksEngine;
extend["1,0x0000b82f38e839152b8f97487300263e0eae00f7"] = artblocksEngine;
extend["1,0x0000004f5c5a4390738b7dd9b662e95e44bf5bb7"] = artblocksEngine;
extend["1,0x00000599ba06d628daea74610094610027cca9b8"] = artblocksEngine;
extend["1,0x000000c3f849598a2e08150f91b1f54193d316e9"] = artblocksEngine;
extend["1,0x000000e6d2c9b681e3fd3c36590d5a2e1c56f4bc"] = artblocksEngine;
extend["1,0x0000a540c5b0b2b17100d63d8d066b00343020bb"] = artblocksEngine;
extend["1,0x0000f6bc84ab98fbd8fce1f6d047965c723f0000"] = artblocksEngine;
extend["1,0x0000149485af7433f8da00419b931100d4aaef42"] = artblocksEngine;
extend["1,0x000023566874e414ef00008c5025782d0a9a3783"] = artblocksEngine;
extend["1,0x0000001590abfb45b052c28fb7dac11c062b9337"] = artblocksEngine;
extend["1,0x0000b52017e1ec58f64171b6001518c07a9aec00"] = artblocksEngine;
extend["1,0x000000b862836c9bbae6cca68a0a2fe5ce497823"] = artblocksEngine;
extend["1,0x000000a35301fa5784e820f489003ffcffdc69a6"] = artblocksEngine;
extend["1,0x0000ec0076f0687e399b8d00570cdc70657e4101"] = artblocksEngine;
extend["1,0x00000058642a13e644fa1571106e3d5e7580d491"] = artblocksEngine;
extend["1,0x000071ce00590014b26c63e039403fa1197cc446"] = artblocksEngine;
extend["1,0x000000606ee90cb15464eaba7c4028b549def16c"] = artblocksEngine;
extend["1,0xa06db200f4b6000000614704a68423a358005be7"] = artblocksEngine;
extend["1,0x000062aeea7af9b200d1b0a41c6e00c0c27e92ff"] = artblocksEngine;
extend["1,0x000000637fddcdd459b047897afb3ea46aa6f334"] = artblocksEngine;
extend["1,0x00000064c65bd96db98840d52b637136a520592e"] = artblocksEngine;
extend["1,0x000000654283cd976221b0e8358999591018cf1b"] = artblocksEngine;
extend["1,0x0000006693e685fcfc54c9d423b5e321b4a15192"] = artblocksEngine;
extend["1,0x0000067b003116628bf6b300ecef8e42663a32c4"] = artblocksEngine;
extend["1,0x00000000e75eadc620f4fcefab32f5173749c3a4"] = artblocksEngine;
extend["1,0x0000000f2927d885e7be55da01cc4c6d5da6b1ba"] = artblocksEngine;
extend["1,0xc04e0000726ed7c5b9f0045bc0c4806321bc6c65"] = artblocksEngine;
extend["1,0x68c01cb4733a82a58d5e7bb31bddbff26a3a35d5"] = artblocksEngine;
extend["1,0x010be6545e14f1dc50256286d9920e833f809c6a"] = artblocksEngine;
extend["1,0x64780ce53f6e966e18a22af13a2f97369580ec11"] = artblocksEngine;
extend["1,0xbb5471c292065d3b01b2e81e299267221ae9a250"] = artblocksEngine;
extend["1,0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"] = artblocksEngine;
extend["1,0x0a1bbd57033f57e7b6743621b79fcb9eb2ce3676"] = artblocksEngine;
extend["1,0x2b3c48be4fb33b0724214aff12b086b0214f8f15"] = artblocksEngine;
extend["1,0x1d0977e86c70eabb5c8fd98db1b08c6d60caa0c1"] = artblocksEngine;
extend["1,0x28f2d3805652fb5d359486dffb7d08320d403240"] = artblocksEngine;
extend["1,0x4d928ab507bf633dd8e68024a1fb4c99316bbdf3"] = artblocksEngine;
extend["1,0x13aae6f9599880edbb7d144bb13f1212cee99533"] = artblocksEngine;
extend["1,0x54a6356244059d5a50b97200a928f19a3682b669"] = artblocksEngine;
extend["1,0x32d4be5ee74376e08038d652d4dc26e62c67f436"] = artblocksEngine;
extend["1,0x62e37f664b5945629b6549a87f8e10ed0b6d923b"] = artblocksEngine;
extend["1,0x67c0b53c8448a10f0eface978fc5be9892f33a2c"] = artblocksEngine;
extend["1,0x73b4797e2fd04fa42a9f3c9bcfbcee19374a9060"] = artblocksEngine;
extend["1,0x7c3ea2b7b3befa1115ab51c09f0c9f245c500b18"] = artblocksEngine;
extend["1,0xbdde08bd57e5c9fd563ee7ac61618cb2ecdc0ce0"] = artblocksEngine;
extend["1,0xa319c382a702682129fcbf55d514e61a16f97f9c"] = artblocksEngine;
extend["1,0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"] = artblocksEngine;
extend["1,0xd10e3dee203579fcee90ed7d0bdd8086f7e53beb"] = artblocksEngine;
extend["1,0xff124d975c7792e706552b18ec9da24781751cab"] = artblocksEngine;
extend["42161,0x47a91457a3a1f700097199fd63c039c4784384ab"] = artblocksEngine;
extend["42161,0x7497909537ce00fdda93c12d5083d8647c593c67"] = artblocksEngine;
extend["42161,0xd1d1222f6d3e4f64db1c025ecd0b314db8449ac4"] = artblocksEngine;
extend["42161,0x0d39ab55664007ff2d089a25480f169c6d0597bb"] = artblocksEngine;
extend["42161,0xd168b708a5385a1cb50cf13f5fbd63149ccc08ab"] = artblocksEngine;
extend["42161,0x8c2111b174fb454fdac4673defa82cbe337ae706"] = artblocksEngine;
extend["42161,0xfb2fc7ee917fb2fa0ab25542fa2e3e1351df5523"] = artblocksEngine;
extend["42161,0x0000000fae63d15270aafe9e08a71cd28079572d"] = artblocksEngine;
extend["42161,0x0000000098ddf2a817189a189a7254c4d16e0ab7"] = artblocksEngine;
extend["8453,0xa39abc16d7b6cfbf2cb1d02de65a0b28101cdad1"] = artblocksEngine;
extend["8453,0x0061b590a42433392bc76b3f3fe1404a5df449c9"] = artblocksEngine;
extend["8453,0x0000000080d04343d60d06e1a36aaf46c9242805"] = artblocksEngine;
extend["8453,0x0000005cb45d63e973d9bf3ea82d35fff6dc5b38"] = artblocksEngine;
extend["8453,0x000000059b9f7949a6427fd556cce376f84be656"] = artblocksEngine;

// Mirage Gallery Curated
// extend["1,0xb7ec7bbd2d2193b47027247fc666fb342d23c4b5"] = mirageGalleryCurated;

// Forgotten Runes
// extend["1,0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42"] = forgottenRunes;

// Forgotten Runes Warriors
// extend["1,0x9690b63eb85467be5267a3603f770589ab12dc95"] = forgottenRunesWarriors;

// Forgotten Souls
// extend["1,0x251b5f14a825c537ff788604ea1b58e49b70726f"] = forgottenSouls;

// Forgotten Ponies
// extend["1,0xf55b615b479482440135ebf1b907fd4c37ed9420"] = forgottenPonies;

// Forgotten Runes Athenaeum
// extend["1,0x7c104b4db94494688027cced1e2ebfb89642c80f"] = forgottenRunesAthenaeum;

// Loot
// extend["1,0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7"] = loot;
// extend["4,0x79e2d470f950f2cf78eef41720e8ff2cf4b3cd78"] = loot;

// Goldfinch
extend["1,0x57686612c601cb5213b01aa8e80afeb24bbd01df"] = goldfinch;

// Cryptokicks IRL
extend["1,0x11708dc8a3ea69020f520c81250abb191b190110"] = cryptokicksIrl;

// Utopia Avatars
extend["1,0x5f076e995290f3f9aea85fdd06d8fae118f2b75c"] = utopiaAvatars;

// Superrare Shared
extend["1,0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0"] = superrareShared;
extend["1,0x41a322b28d0ff354040e2cbc676f0320d8c8850d"] = superrareShared850d;

//Foundation Shared
extend["1,0x3b3ee1931dc30c1957379fac9aba94d1c48a5405"] = foundationShared;

// Kanpai Pandas
extend["1,0xacf63e56fd08970b43401492a02f6f38b6635c91"] = kanpaiPandas;

// ZED Run
extend["137,0x67f4732266c7300cca593c814d46bee72e40659f"] = zedRun;
extend["80001,0xb8290f7a3ba474fe8e9179f419c1485c078e044b"] = zedRun;

// Hape
extend["1,0x4db1f25d3d98600140dfc18deb7515be5bd293af"] = hape;

// punks2023
extend["1,0x789e35a999c443fe6089544056f728239b8ffee7"] = punks2023;

// ENS
extend["1,0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"] = ens;

// tokenUriExtend
extendTokenUriContracts["8453,0x822d97e3294c405f7c0abc0ba271e6cd1f025570"] = tokenUriExtend;
extendTokenUriContracts["8453,0x7c00170161a557c2547467f2d9474e514d162885"] = tokenUriExtend;
extendTokenUriContracts["8453,0xd2235a29766125aebaf13e862c01e2ec8b0a6fb0"] = tokenUriExtend;
extendTokenUriContracts["8453,0x4836496a26aaf39f8a0a7ba69500a931fa059129"] = tokenUriExtend;
extendTokenUriContracts["137,0xe7b93ca2c024220cbd94d47d5dda8b6e51dc4b7f"] = tokenUriExtend;
extendTokenUriContracts["137,0x5bc41bbb137ee85eea4ede5961faf42fce40cc6f"] = tokenUriExtend;
extendTokenUriContracts["137,0x2e469931f02bf8807d004fc26ea8fd815e3b5fbc"] = tokenUriExtend;
extendTokenUriContracts["137,0x2a0fc65ca5d439860377849d2918609b22472349"] = tokenUriExtend;
extendTokenUriContracts["137,0x6416bff8b8776d94749b73e501f64bcb25d6e9f2"] = tokenUriExtend;
extendTokenUriContracts["137,0xbb10ed4b6675013eb91b5926baa66669868d6723"] = tokenUriExtend;
extendTokenUriContracts["137,0x53973c9913943a884669ca3314ff99237f531706"] = tokenUriExtend;
extendTokenUriContracts["137,0xcac387a146bb476a4034fb6584c8ed121aa0b9c2"] = tokenUriExtend;
extendTokenUriContracts["80094,0xa0cf472e6132f6b822a944f6f31aa7b261c7c375"] = tokenUriExtend;
