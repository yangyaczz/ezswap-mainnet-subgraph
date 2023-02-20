import {
  SwapNFTInPair as SwapNFTInPairEvent,
  SwapNFTOutPair as SwapNFTOutPairEvent,

  TokenDeposit as TokenDepositEvent,
  TokenWithdrawal as TokenWithdrawalEvent,

  NFTWithdrawal as NFTWithdrawalEvent,

  OwnershipTransferred as OwnershipTransferredEvent,
  SpotPriceUpdate as SpotPriceUpdateEvent,
  FeeUpdate as FeeUpdateEvent,
  DeltaUpdate as DeltaUpdateEvent,
  AssetRecipientChange as AssetRecipientChangeEvent,
} from "../generated/templates/LSSVMPairEnumerableETH/LSSVMPairEnumerableETH";

import {
  Pair
} from "../generated/schema";

import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { fetchBalanceOf, fetchNFTIds } from "./utilsIERC721";



///////////////////////////////////////////////////////////////////////  swap nft in √ (is trade pool?) // eth out √

export function handleSwapNFTInPair(event: SwapNFTInPairEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair) {
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.lastNftCount = pair.nftCount;
    pair.nftCount = fetchBalanceOf(nftAddress, event.address)
    pair.nftIds = fetchNFTIds(event.address)

    // caculate volumn
    let tradeCount: BigInt = pair.nftCount!.minus(pair.lastNftCount!);

    let addVolumn = tradeCount.times(pair.lastSpotPrice!)
    pair.ethVolume = pair.ethVolume!.plus(addVolumn)

    pair.swapCount = pair.swapCount!.plus(BigInt.fromI32(1))
    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
  /////////////
}


///////////////////////////////////////////////////////////////////////////////  for pair: nft out √ //  eth in √ (is trade pool?)

export function handleSwapNFTOutPair(event: SwapNFTOutPairEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair) {
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.lastNftCount = pair.nftCount;
    pair.nftCount = fetchBalanceOf(nftAddress, event.address)
    pair.nftIds = fetchNFTIds(event.address)

    // caculate volumn
    let tradeCount : BigInt = pair.lastNftCount!.minus(pair.nftCount!)

    let addVolumn = tradeCount.times(pair.lastSpotPrice!)
    pair.ethVolume = pair.ethVolume!.plus(addVolumn)


    pair.swapCount = pair.swapCount!.plus(BigInt.fromI32(1))
    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
  /////////////
}

///////////////////////////////////////////////////////////////////////////////////////////////  nft withdraw  √
export function handleNFTWithdrawal(event: NFTWithdrawalEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair) {
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.nftIds = fetchNFTIds(event.address)
    pair.nftCount = fetchBalanceOf(nftAddress, event.address)
    pair.lastNftCount = fetchBalanceOf(nftAddress, event.address)
    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
  /////////////

}


//////////////////////////////////////////////////////////////  eth  desposit and withdraw  √  unuse

export function handleTokenDeposit(event: TokenDepositEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }

  if (pair.tx == event.transaction.hash.toHexString()) {
    return;
  }

  // unuse

  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleTokenWithdrawal(event: TokenWithdrawalEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }

  // unuse

  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

////////////////////////////////////////////////////  owner change

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.owner = event.params.newOwner.toHexString();
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleSpotPriceUpdate(event: SpotPriceUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.lastSpotPrice = pair.spotPrice;
  pair.spotPrice = event.params.newSpotPrice;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleFeeUpdate(event: FeeUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.fee = event.params.newFee;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleDeltaUpdate(event: DeltaUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.delta = event.params.newDelta;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleAssetRecipientChange(
  event: AssetRecipientChangeEvent
): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.assetRecipient = event.params.a.toHexString();
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}
