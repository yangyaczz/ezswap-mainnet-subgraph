import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  NewPair as NewPairEvent,
  NFTDeposit as NFTDepositEvent,
  ProtocolFeeMultiplierUpdate as ProtocolFeeMultiplierUpdateEvent
} from "../generated/PairFactory/LSSVMPairFactory";

import { Pair, ProtocolFeeMultiplier } from "../generated/schema";
import { LSSVMPairEnumerableETH } from "../generated/templates";
import { fetchBalanceOf, fetchNFTIds } from "./utilsIERC721";

import { LSSVMPairEnumerableETH as IPair } from "../generated/PairFactory/LSSVMPairEnumerableETH";


// need to set up bondingCurveType address
export function handleNewPair(event: NewPairEvent): void {

  LSSVMPairEnumerableETH.create(event.params.poolAddress)
  let pair = new Pair(event.params.poolAddress.toHexString())

  if (pair) {
    let contract = IPair.bind(event.params.poolAddress);

    // tx
    pair.tx = event.transaction.hash.toHexString();

    // collection
    let collection = contract.try_nft();
    if (!collection.reverted) {
      pair.collection = collection.value.toHexString();
    } else {
      pair.collection = null
    }

    // owner
    let owner = contract.try_owner();
    if (!owner.reverted) {
      pair.owner = owner.value.toHexString();
    } else {
      pair.owner = null
    }

    // token
    pair.token = null;  // unuse

    // type
    let type = contract.try_poolType();
    if (!type.reverted) {
      pair.type = BigInt.fromI32(type.value);
    } else {
      pair.type = null
    }

    // assetRecipient
    let assetRecipient = contract.try_assetRecipient();
    if (!assetRecipient.reverted) {
      pair.assetRecipient = assetRecipient.value.toHexString();
    } else {
      pair.assetRecipient = null
    }

    // bondingCurve
    let bondingCurve = contract.try_bondingCurve();
    if (!bondingCurve.reverted) {
      pair.bondingCurve = bondingCurve.value.toHexString();
      if (bondingCurve.value.equals(Address.fromString("0x71f5033d266d3983b08340c9266971b8e643cbac"))) {
        pair.bondingCurveType = BigInt.fromI32(0)  // liner
      } else if (bondingCurve.value.equals(Address.fromString("0x241c4d939e3c3b4de9113b63d7640ebff9444703"))) {
        pair.bondingCurveType = BigInt.fromI32(1)  // exp
      } else {
        pair.bondingCurveType = null
      }
    } else {
      pair.bondingCurve = null
    }

    // delta
    let delta = contract.try_delta();
    if (!delta.reverted) {
      pair.delta = delta.value;
    } else {
      pair.delta = null
    }

    // fee
    let fee = contract.try_fee();
    if (!fee.reverted) {
      pair.fee = fee.value;
    } else {
      pair.fee = null
    }

    // spotPrice
    let spotPrice = contract.try_spotPrice();
    if (!spotPrice.reverted) {
      pair.spotPrice = spotPrice.value;
      pair.lastSpotPrice = spotPrice.value;
    } else {
      pair.spotPrice = null
    }

    // nftIds
    pair.nftIds = fetchNFTIds(event.params.poolAddress)

    // nftCount
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.nftCount = fetchBalanceOf(nftAddress, event.params.poolAddress)
    pair.lastNftCount = fetchBalanceOf(nftAddress, event.params.poolAddress)

    // ethBalance tokenBalance  unuse
    pair.ethBalance = null
    pair.tokenBalance = null;

    // ethVolume
    pair.ethVolume = BigInt.fromI32(0); //

    // swapCount
    pair.swapCount = BigInt.fromI32(0) //

    // createTimestamp updateTimestamp
    pair.createTimestamp = event.block.timestamp;  // 
    pair.updateTimestamp = event.block.timestamp;  // 

    pair.save()
  }
}

export function handlerNFTDeposit(event: NFTDepositEvent): void {

  let pair = Pair.load(event.params.poolAddress.toHexString())

  if (pair) {
    let nftAddress: Address = Address.fromString(pair.collection!)
    pair.nftIds = fetchNFTIds(event.params.poolAddress)
    pair.nftCount = fetchBalanceOf(nftAddress, event.params.poolAddress)
    pair.lastNftCount = fetchBalanceOf(nftAddress, event.params.poolAddress)
    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
}



export function handleProtocolFeeMultiplierUpdate(event: ProtocolFeeMultiplierUpdateEvent): void {
  let feeEntity = ProtocolFeeMultiplier.load("fee")
  if (!feeEntity) {
    feeEntity = new ProtocolFeeMultiplier("fee")
  }

  feeEntity.pfm = event.params.newMultiplier
  feeEntity.save()
}