import BigNumber from 'bignumber.js';
import {ethers} from 'ethers';

const ETHER_DECIMALS = 18;

export function parseUnits(amount: string, unit: number) {
  const bnAmount = new BigNumber(amount);
  try {
    return ethers.utils.parseUnits(bnAmount.toFixed(unit), unit);
  } catch (e) {
    return ethers.BigNumber.from(bnAmount.times(Math.pow(10, unit)).toFixed(0));
  }
}

export function parseEthers(amount: string) {
  return parseUnits(amount, ETHER_DECIMALS);
}

export const unitsOf = ethers.utils.formatUnits;
export const ethersOf = ethers.utils.formatEther;

export function unifyAddresses(address: string) {
  return ethers.utils.getAddress(address.toLocaleLowerCase());
}

export function isAddress(address: string) {
  return ethers.utils.isAddress(address.toLocaleLowerCase());
}
