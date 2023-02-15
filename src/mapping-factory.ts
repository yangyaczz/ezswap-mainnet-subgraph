import { Address, BigInt } from "@graphprotocol/graph-ts"; 

import {
  CreatePairETHCall,
  NFTDeposit as NFTDepositEvent,
  ProtocolFeeMultiplierUpdate as ProtocolFeeMultiplierUpdateEvent
} from "../generated/PairFactory/LSSVMPairFactory";

import { Pair, ProtocolFeeMultiplier } from "../generated/schema";
import { LSSVMPairEnumerableETH } from "../generated/templates";
import { fetchBalanceOf , fetchNFTIds} from "./utilsIERC721";

export function handleCreatePairETH(call: CreatePairETHCall): void { 

  LSSVMPairEnumerableETH.create(call.outputs.pair)
  let pair = new Pair(call.outputs.pair.toHexString())

  pair.tx = call.transaction.hash.toHexString() //
  pair.collection = call.inputs._nft.toHexString();   //
  pair.owner = call.from.toHexString();  //
  pair.token = null;  // unuse
  pair.type = BigInt.fromI32(call.inputs._poolType);  // 
  pair.assetRecipient = call.inputs._assetRecipient.toHexString(); // 
  pair.bondingCurve = call.inputs._bondingCurve.toHexString();  //
  pair.delta = call.inputs._delta;  //
  pair.fee = call.inputs._fee; //
  pair.spotPrice = call.inputs._spotPrice;  //
  pair.nftIds = call.inputs._initialNFTIDs;  // unuse
  pair.nftCount = BigInt.fromI32(call.inputs._initialNFTIDs.length) // unuse
  pair.ethBalance = call.transaction.value; // 
  pair.tokenBalance = null; // unuse
  pair.ethVolume = BigInt.fromI32(0); //
  pair.createTimestamp = call.block.timestamp;  // 
  pair.updateTimestamp = call.block.timestamp;  // 
  pair.save();
}

export function handlerNFTDeposit(event: NFTDepositEvent) : void {

  let pair = Pair.load(event.params.poolAddress.toHexString()); 
  if (pair){
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.nftCount = fetchBalanceOf(nftAddress, event.params.poolAddress)
    pair.nftIds = fetchNFTIds(event.params.poolAddress)
    pair.save()
  }
}



export function handleProtocolFeeMultiplierUpdate(event: ProtocolFeeMultiplierUpdateEvent) : void {
  let feeEntity = ProtocolFeeMultiplier.load("fee")
  if (!feeEntity) {
    feeEntity = new ProtocolFeeMultiplier("fee")
  }

  feeEntity.pfm = event.params.newMultiplier
  feeEntity.save()
}