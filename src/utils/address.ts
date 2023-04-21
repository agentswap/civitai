import { utils } from 'ethers';

/**
 * Copied from useDapp
 */
export function shortenAddressString(str: string) {
  return str.substring(0, 6) + '...' + str.substring(str.length - 4);
}

/**
 * Copied from useDapp
 */
export function shortenAddress(address: string): string {
  try {
    const formattedAddress = utils.getAddress(address);
    return shortenAddressString(formattedAddress);
  } catch {
    throw new TypeError("Invalid input, address can't be parsed");
  }
}

/**
 * Copied from useDapp
 */
export function shortenIfAddress(address: string): string {
  if (utils.isAddress(address)) {
    return shortenAddress(address);
  }
  return '';
}
