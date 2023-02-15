import {
  SwapNFTInPair as SwapNFTInPairEvent,
  SwapNFTsForTokenCall,
  SwapNFTOutPair as SwapNFTOutPairEvent,
  SwapTokenForAnyNFTsCall,
  SwapTokenForSpecificNFTsCall,

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
  Pair,
  ProtocolFeeMultiplier,
} from "../generated/schema";

import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { LSSVMPairEnumerableETH } from "../generated/templates";

import { fetchBalanceOf , fetchNFTIds} from "./utilsIERC721";



///////////////////////////////////////////////////////////////////////  swap nft in √ (is trade pool?) // eth out √

export function handleSwapNFTInPair(event: SwapNFTInPairEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair){
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.nftCount = fetchBalanceOf(nftAddress, event.address)
    pair.nftIds = fetchNFTIds(event.address)
    pair.save()
  }
  /////////////
}

export function handleSwapNFTsForToken(call: SwapNFTsForTokenCall): void {

  let pair = Pair.load(call.to.toHexString());
  if (!pair) {
    return
  }


  //////////protocol fee
  let feeEntity = ProtocolFeeMultiplier.load("fee"); 
  let pfm: BigInt;
  if (!feeEntity) {
    pfm = BigInt.fromU64(10 * 10 ** 15);
  } else {
    pfm = feeEntity.pfm!;
  }
  let fee = pair.fee!


  pair.ethVolume = pair.ethVolume!.plus(call.outputs.outputAmount);

  let top: BigInt = (BigInt.fromU64(10 ** 18).minus(fee))
  let under: BigInt = (BigInt.fromU64(10 ** 18).minus(pfm).minus(fee))
  let outPut: BigInt =call.outputs.outputAmount.times(top).div(under)

  pair.ethBalance = pair.ethBalance!.minus(outPut);

  if (BigInt.fromI32(0).gt(pair.ethBalance!)) {
    pair.ethBalance = BigInt.fromI32(0)
  }


  pair.updateTimestamp = call.block.timestamp;
  pair.save();
}

///////////////////////////////////////////////////////////////////////////////  for pair: nft out √ //  eth in √ (is trade pool?)

export function handleSwapNFTOutPair(event: SwapNFTOutPairEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair){
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.nftCount = fetchBalanceOf(nftAddress, event.address)
    pair.nftIds = fetchNFTIds(event.address)
    pair.save()
  }
  /////////////
}

export function handleSwapTokenForAnyNFTs(call: SwapTokenForAnyNFTsCall): void {

  let pair = Pair.load(call.to.toHexString());
  if (!pair) {
    return
  }


  /////////////  fee
  let feeEntity = ProtocolFeeMultiplier.load("fee");
  let pfm: BigInt;
  if (!feeEntity) {
    pfm = BigInt.fromU64(10 * 10 ** 15);
  } else {
    pfm = feeEntity.pfm!;
  }
  let fee = pair.fee!

  pair.ethVolume = pair.ethVolume!.plus(call.outputs.inputAmount);

  let top: BigInt = (BigInt.fromU64(10 ** 18).plus(fee))
  let under:BigInt = (BigInt.fromU64(10 ** 18).plus(pfm).plus(fee))
  let inPut: BigInt = call.outputs.inputAmount.times(top).div(under)

  //  if trade pool, pair add eth
  if (pair.type!.equals(BigInt.fromI32(2))) {
    pair.ethBalance = pair.ethBalance!.plus(inPut);
  }

  pair.updateTimestamp = call.block.timestamp;
  pair.save();
}

export function handleSwapTokenForSpecificNFTs(
  call: SwapTokenForSpecificNFTsCall
): void {

  let pair = Pair.load(call.to.toHexString());
  if (!pair) {
    return
  }

  /////////////  fee
  let feeEntity = ProtocolFeeMultiplier.load("fee");
  let pfm: BigInt;
  if (!feeEntity) {
    pfm = BigInt.fromU64(10 * 10 ** 15);
  } else {
    pfm = feeEntity.pfm!;
  }
  let fee = pair.fee!

  pair.ethVolume = pair.ethVolume!.plus(call.outputs.inputAmount);

  let top: BigInt = (BigInt.fromU64(10 ** 18).plus(fee))
  let under:BigInt = (BigInt.fromU64(10 ** 18).plus(pfm).plus(fee))
  let inPut: BigInt = call.outputs.inputAmount.times(top).div(under)

  //  if trade pool, pair add eth
  if (pair.type!.equals(BigInt.fromI32(2))) {
    pair.ethBalance = pair.ethBalance!.plus(inPut);
  }

  ///////////////////

  pair.updateTimestamp = call.block.timestamp;
  pair.save();
}

///////////////////////////////////////////////////////////////////////////////////////////////  nft withdraw  √
export function handleNFTWithdrawal(event: NFTWithdrawalEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair){
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.nftCount = fetchBalanceOf(nftAddress, event.address)
    pair.nftIds = fetchNFTIds(event.address)
    pair.save()
  }
  /////////////

}


//////////////////////////////////////////////////////////////  eth  desposit and withdraw  √

export function handleTokenDeposit(event: TokenDepositEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair){
    return
  }

  if (pair.tx == event.transaction.hash.toHexString()) {
    return;
  }

  pair.ethBalance = pair.ethBalance!.plus(event.params.amount);
  pair.updateTimestamp = event.block.timestamp;

  pair.save();
}

export function handleTokenWithdrawal(event: TokenWithdrawalEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair){
    return
  }
  pair.ethBalance = pair.ethBalance!.minus(event.params.amount);
  if (BigInt.fromI32(0).gt(pair.ethBalance!)) {
    pair.ethBalance = BigInt.fromI32(0)
  }

  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

////////////////////////////////////////////////////  owner change

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair){
    return
  }
  pair.owner = event.params.newOwner.toHexString();
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleSpotPriceUpdate(event: SpotPriceUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair){
    return
  }
  pair.spotPrice = event.params.newSpotPrice;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleFeeUpdate(event: FeeUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair){
    return
  }
  pair.fee = event.params.newFee;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleDeltaUpdate(event: DeltaUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair){
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
  if (!pair){
    return
  }
  pair.assetRecipient = event.params.a.toHexString();
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}
