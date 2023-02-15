import { Address, BigInt } from "@graphprotocol/graph-ts";
import { IERC721 } from "../generated/PairFactory/IERC721";
import { LSSVMPairEnumerableETH } from "../generated/PairFactory/LSSVMPairEnumerableETH";


export function fetchBalanceOf(
  collectionAddress: Address,
  ownerAddress: Address
): BigInt | null{
  let contract = IERC721.bind(collectionAddress);

  let result = contract.try_balanceOf(ownerAddress);
  if (!result.reverted) {
    return result.value;
  } else {
    return null
  }
}


export function fetchNFTIds(
  pairAddress: Address
): BigInt[] | null{
  let contract = LSSVMPairEnumerableETH.bind(pairAddress);

  let result = contract.try_getAllHeldIds();
  if (!result.reverted) {
    return result.value;
  } else {
    return null
  }
}