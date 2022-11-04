import {
  NFTWithdrawal as NFTWithdrawalEvent,
  WithdrawERC721Call,
  SwapNFTInPair as SwapNFTInPairEvent,
  SwapNFTsForTokenCall,
  TokenDeposit as TokenDepositEvent,
  TokenWithdrawal as TokenWithdrawalEvent,
  SwapNFTOutPair as SwapNFTOutPairEvent,
  SwapTokenForAnyNFTsCall,
  SwapTokenForSpecificNFTsCall,
  SpotPriceUpdate as SpotPriceUpdateEvent,
  FeeUpdate as FeeUpdateEvent,
  DeltaUpdate as DeltaUpdateEvent,
  AssetRecipientChange as AssetRecipientChangeEvent,
} from "../generated/templates/LSSVMPairEnumerableETH/LSSVMPairEnumerableETH";

import {
  NFTWithdrawal,
  Pair,
  NFTInPair,
  NFTOutPair,
  ProtocolFeeMultiplier,
} from "../generated/schema";

import { BigInt } from "@graphprotocol/graph-ts";



///////////////////////////////////////////////////////////////////////  swap nft in √ (is trade pool?) // eth out √

export function handleSwapNFTInPair(event: SwapNFTInPairEvent): void {
  let entity = new NFTInPair(event.transaction.hash.toHexString());
  entity.pair = event.address.toHexString();
  entity.save();
}

export function handleSwapNFTsForToken(call: SwapNFTsForTokenCall): void {
  let entity = NFTInPair.load(call.transaction.hash.toHexString())!;
  let pair = Pair.load(entity.pair)!;

  let count: BigInt = BigInt.fromI32(call.inputs.nftIds.length);

  entity.count = count;
  entity.save();

  // if trade pool, pair add nft
  if (pair.type!.notEqual(BigInt.fromI32(0))) {
    pair.nftCount = pair.nftCount!.plus(count);

    ////// add nft
    let origin = pair.nftIds!;
    let inIds = call.inputs.nftIds;
    pair.nftIds = origin.concat(inIds);
    //////
  }

  //////////protocol fee
  let feeEntity = ProtocolFeeMultiplier.load("fee");
  let pfm: BigInt;
  if (!feeEntity) {
    pfm = BigInt.fromU64(10 ** 16);
  } else {
    pfm = feeEntity.pfm!;
  }
  let fee = pair.fee!


  let top: BigInt = BigInt.fromU64(10 ** 18)
  let under: BigInt = BigInt.fromU64(10 ** 18).minus(pfm).minus(fee)
  let initValue = call.outputs.outputAmount.times(top).div(under);

  pair.ethVolume = pair.ethVolume!.plus(initValue);

  //////////
  let top2: BigInt = BigInt.fromU64(10 ** 18).minus(fee)
  let base: BigInt = BigInt.fromU64(10 ** 18)

  let outPut: BigInt = initValue.times(top2).div(base)

  pair.ethBalance = pair.ethBalance!.minus(outPut);
  if (BigInt.fromI32(0).gt(pair.ethBalance!)) {
    pair.ethBalance = BigInt.fromI32(0)
  }


  pair.updateTimestamp = call.block.timestamp;
  pair.save();
}

///////////////////////////////////////////////////////////////////////////////  for pair: nft out √ //  eth in √ (is trade pool?)

export function handleSwapNFTOutPair(event: SwapNFTOutPairEvent): void {
  let entity = new NFTOutPair(event.transaction.hash.toHexString());
  entity.pair = event.address.toHexString();
  entity.save();
}

export function handleSwapTokenForAnyNFTs(call: SwapTokenForAnyNFTsCall): void {
  let entity = NFTOutPair.load(call.transaction.hash.toHexString())!;
  let pair = Pair.load(entity.pair)!;

  let count: BigInt = call.inputs.numNFTs;
  pair.nftCount = pair.nftCount!.minus(count);

  /////////////  fee
  let feeEntity = ProtocolFeeMultiplier.load("fee");
  let pfm: BigInt;
  if (!feeEntity) {
    pfm = BigInt.fromU64(10 ** 16);
  } else {
    pfm = feeEntity.pfm!;
  }
  let fee = pair.fee!

  let top:BigInt = BigInt.fromU64(10 ** 18)
  let under:BigInt = BigInt.fromU64(10 ** 18).plus(pfm).plus(fee)
  let initValue = call.outputs.inputAmount.times(top).div(under);

  pair.ethVolume = pair.ethVolume!.plus(call.outputs.inputAmount);
  /////////////


  //  if trade pool, pair add eth
  if (pair.type!.equals(BigInt.fromI32(2))) {
    let top2: BigInt = BigInt.fromU64(10 ** 18).plus(fee)
    let base: BigInt = BigInt.fromU64(10 ** 18)
    let inPut: BigInt = initValue.times(top2).div(base)
    pair.ethBalance = pair.ethBalance!.plus(inPut);
  }


  /////////////////// remove nft
  let origin = pair.nftIds!;
  let remove = call.inputs.numNFTs;

  for (let i = 0; i < remove.toI32(); i++) {
    origin.pop();
  }

  pair.nftIds = origin;
  ///////////////////

  pair.updateTimestamp = call.block.timestamp;
  pair.save();
}

export function handleSwapTokenForSpecificNFTs(
  call: SwapTokenForSpecificNFTsCall
): void {
  let entity = NFTOutPair.load(call.transaction.hash.toHexString())!;
  let pair = Pair.load(entity.pair)!;

  let count: BigInt = BigInt.fromI32(call.inputs.nftIds.length);
  pair.nftCount = pair.nftCount!.minus(count);


  /////////////  fee
  let feeEntity = ProtocolFeeMultiplier.load("fee");
  let pfm: BigInt;
  if (!feeEntity) {
    pfm = BigInt.fromU64(10 ** 16);
  } else {
    pfm = feeEntity.pfm!;
  }
  let fee = pair.fee!

  let top:BigInt = BigInt.fromU64(10 ** 18)
  let under:BigInt = BigInt.fromU64(10 ** 18).plus(pfm).plus(fee)
  let initValue = call.outputs.inputAmount.times(top).div(under);

  pair.ethVolume = pair.ethVolume!.plus(call.outputs.inputAmount);
  /////////////


  //  if trade pool, pair add eth 
  if (pair.type!.equals(BigInt.fromI32(2))) {
    let top2: BigInt = BigInt.fromU64(10 ** 18).plus(fee)
    let base: BigInt = BigInt.fromU64(10 ** 18)
    let inPut: BigInt = initValue.times(top2).div(base)
    pair.ethBalance = pair.ethBalance!.plus(inPut);
  }


  ///////////////////    remove nft
  let origin = pair.nftIds!;
  let remove = call.inputs.nftIds;

  let r: BigInt;
  for (let i = 0; i < remove.length; i++) {
    r = remove[i];

    for (let j = 0; j < origin.length; j++) {
      if (origin[j].equals(r)) {
        origin.splice(j, 1);
      }
    }
  }

  pair.nftIds = origin;
  ///////////////////

  pair.updateTimestamp = call.block.timestamp;
  pair.save();
}

///////////////////////////////////////////////////////////////////////////////////////////////  nft withdraw  √
export function handleNFTWithdrawal(event: NFTWithdrawalEvent): void {}

export function handleWithdrawERC721(call: WithdrawERC721Call): void {
  let pair = Pair.load(call.to.toHexString())!;
  let pairnft = pair.collection;
  let a = call.inputs.a.toHexString();

  let count: BigInt = BigInt.fromI32(call.inputs.nftIds.length);

  if (a == pairnft) {
    let entity = new NFTWithdrawal(call.transaction.hash.toHexString());

    entity.count = count;
    entity.save();

    ///// remove nft
    let origin = pair.nftIds!;
    let remove = call.inputs.nftIds;

    let r: BigInt;
    for (let i = 0; i < remove.length; i++) {
      r = remove[i];

      for (let j = 0; j < origin.length; j++) {
        if (origin[j].equals(r)) {
          origin.splice(j, 1);
        }
      }
    }

    pair.nftIds = origin;
    ///////////////////

    pair.nftCount = pair.nftCount!.minus(count);
    pair.updateTimestamp = call.block.timestamp;
    pair.save();
  }
}

//////////////////////////////////////////////////////////////  eth  desposit and withdraw  √

export function handleTokenDeposit(event: TokenDepositEvent): void {
  let pair = Pair.load(event.address.toHexString())!;

  if (pair.tx == event.transaction.hash.toHexString()) {
    return;
  }

  pair.ethBalance = pair.ethBalance!.plus(event.params.amount);
  pair.updateTimestamp = event.block.timestamp;

  pair.save();
}

export function handleTokenWithdrawal(event: TokenWithdrawalEvent): void {
  let pair = Pair.load(event.address.toHexString())!;
  pair.ethBalance = pair.ethBalance!.minus(event.params.amount);
  if (BigInt.fromI32(0).gt(pair.ethBalance!)) {
    pair.ethBalance = BigInt.fromI32(0)
  }

  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

////////////////////////////////////////////////////  owner change

export function handleSpotPriceUpdate(event: SpotPriceUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString())!;
  pair.spotPrice = event.params.newSpotPrice;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleFeeUpdate(event: FeeUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString())!;
  pair.fee = event.params.newFee;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleDeltaUpdate(event: DeltaUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString())!;
  pair.delta = event.params.newDelta;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleAssetRecipientChange(
  event: AssetRecipientChangeEvent
): void {
  let pair = Pair.load(event.address.toHexString())!;
  pair.assetRecipient = event.params.a.toHexString();
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}
