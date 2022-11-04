import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import {
  NewPair as NewPairEvent,
  CreatePairETHCall,
  NFTDeposit as NFTDepositEvent,
  DepositNFTsCall,
  ProtocolFeeMultiplierUpdate as ProtocolFeeMultiplierUpdateEvent
} from "../generated/PairFactory/LSSVMPairFactory";

import { Pair, DepositNFT, ProtocolFeeMultiplier } from "../generated/schema";
import { LSSVMPairEnumerableETH } from "../generated/templates";

export function handleCreatePairETH(call: CreatePairETHCall): void {
  // let pair = Pair.load(call.outputs.pair.toHexString())!; //

  LSSVMPairEnumerableETH.create(call.outputs.pair)
  let pair = new Pair(call.outputs.pair.toHexString())

  pair.tx = call.transaction.hash.toHexString() //
  pair.collection = call.inputs._nft.toHexString();   //
  pair.owner = call.from.toHexString();  //
  pair.token = null;  // 
  pair.type = BigInt.fromI32(call.inputs._poolType);  // 
  pair.assetRecipient = call.inputs._assetRecipient.toHexString(); // 
  pair.bondingCurve = call.inputs._bondingCurve.toHexString();  //
  pair.delta = call.inputs._delta;  //
  pair.fee = call.inputs._fee; //
  pair.spotPrice = call.inputs._spotPrice;  //
  pair.nftIds = call.inputs._initialNFTIDs;  ///////////////
  pair.nftCount = BigInt.fromI32(call.inputs._initialNFTIDs.length) //
  pair.ethBalance = call.transaction.value; // 
  pair.tokenBalance = null;
  pair.ethVolume = BigInt.fromI32(0); 
  pair.createTimestamp = call.block.timestamp;  // 
  pair.updateTimestamp = call.block.timestamp;  // 
  pair.save();
}

export function handleNewPairEvent(event: NewPairEvent): void {
  // LSSVMPairEnumerableETH.create(event.params.poolAddress)

  // let pair = new Pair(event.params.poolAddress.toHexString())
  // pair.tx = event.transaction.hash.toHexString()
  // pair.save();
}


///////////////////////
export function handleDepositNFTs(call: DepositNFTsCall): void {


  let entity = DepositNFT.load(call.transaction.hash.toHexString());
  if (!entity) {
    return
  }

  let count: BigInt = BigInt.fromI32(call.inputs.ids.length);

  entity.count = count
  entity.collection = call.inputs._nft.toHexString();
  entity.save();

  let pair = Pair.load(call.inputs.recipient.toHexString())!

  // add nft
  let ids0 = call.inputs.ids
  let ids1 = pair.nftIds!
  pair.nftIds = ids1.concat(ids0)
  /////////////////

  pair.nftCount = pair.nftCount!.plus(count)
  pair.updateTimestamp = call.block.timestamp;

  pair.save();
  
}

export function handlerNFTDeposit(event: NFTDepositEvent) : void {
  let entity = new DepositNFT(event.transaction.hash.toHexString())
  entity.pair = event.params.poolAddress.toHexString()
  entity.save()
}

export function handleProtocolFeeMultiplierUpdate(event: ProtocolFeeMultiplierUpdateEvent) : void {
  let feeEntity = ProtocolFeeMultiplier.load("fee")
  if (!feeEntity) {
    feeEntity = new ProtocolFeeMultiplier("fee")
  }

  feeEntity.pfm = event.params.newMultiplier
  feeEntity.save()
}