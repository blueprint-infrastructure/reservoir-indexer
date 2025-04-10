import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumberish } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";

import { BaseBuildParams, BaseBuilder, BaseOrderInfo } from "../base";
import * as Addresses from "../../addresses";
import { Order } from "../../order";
import * as Types from "../../types";
import { BytesEmpty, lc, s } from "../../../utils";

interface BuildParams extends BaseBuildParams {
  startTokenId: BigNumberish;
  endTokenId: BigNumberish;
}

interface OrderInfo extends BaseOrderInfo {
  startTokenId: BigNumberish;
  endTokenId: BigNumberish;
}

export class TokenRangeBuilder extends BaseBuilder {
  public isValid(order: Order): boolean {
    try {
      const [startTokenId, endTokenId] = defaultAbiCoder.decode(
        ["uint256", "uint256"],
        order.params.nftProperties[0].propertyData
      );

      const copyOrder = this.build({
        ...order.params,
        direction: order.params.direction === Types.TradeDirection.SELL ? "sell" : "buy",
        contract: order.params.nft,
        maker: order.params.maker,
        paymentToken: order.params.erc20Token,
        price: order.params.erc20TokenAmount,
        amount: order.params.nftAmount,
        startTokenId,
        endTokenId,
      });

      if (!copyOrder) {
        return false;
      }

      if (copyOrder.hash() !== order.hash()) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }

  public build(params: BuildParams) {
    this.defaultInitialize(params);

    return new Order(this.chainId, {
      kind: params.amount ? "erc1155-token-range" : "erc721-token-range",
      direction: params.direction === "sell" ? Types.TradeDirection.SELL : Types.TradeDirection.BUY,
      maker: params.maker,
      taker: AddressZero,
      expiry: params.expiry!,
      nonce: s(params.nonce)!,
      erc20Token: params.paymentToken,
      erc20TokenAmount: s(params.price),
      fees: params.fees!.map(({ recipient, amount }) => ({
        recipient: lc(recipient),
        amount: s(amount),
        feeData: BytesEmpty,
      })),
      nft: params.contract,
      nftId: "0",
      nftProperties: [
        {
          propertyValidator: Addresses.TokenRangeValidator[this.chainId],
          propertyData: defaultAbiCoder.encode(
            ["uint256", "uint256"],
            [s(params.startTokenId), s(params.endTokenId)]
          ),
        },
      ],
      nftAmount: params.amount ? s(params.amount) : undefined,
      signatureType: params.signatureType,
      v: params.v,
      r: params.r,
      s: params.s,
    });
  }

  public buildMatching(
    _order: Order,
    data: {
      tokenId: BigNumberish;
      amount?: BigNumberish;
      unwrapNativeToken?: boolean;
    }
  ) {
    return {
      nftId: s(data.tokenId),
      nftAmount: data.amount ? s(data.amount) : "1",
      unwrapNativeToken: data.unwrapNativeToken,
    };
  }

  public getInfo(order: Order): OrderInfo {
    const [startTokenId, endTokenId] = defaultAbiCoder.decode(
      ["uint256", "uint256"],
      order.params.nftProperties[0].propertyData
    );

    return { startTokenId, endTokenId };
  }
}
