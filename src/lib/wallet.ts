import { ethers } from "ethers";

export interface WalletData {
  address: string;
  mnemonic: string;
  privateKey: string;
}

/**
 * Generate a new random wallet
 */
export function generateWallet(): WalletData {
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    mnemonic: wallet.phrase, // ✅ ethers v6
    privateKey: wallet.privateKey,
  };
}

/**
 * Import wallet from mnemonic phrase
 */
export function importFromMnemonic(mnemonic: string): WalletData {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  return {
    address: wallet.address,
    mnemonic, // ✅ keep original phrase
    privateKey: wallet.privateKey,
  };
}

/**
 * Import wallet from private key
 */
export function importFromPrivateKey(privateKey: string): WalletData {
  const wallet = new ethers.Wallet(privateKey);

  return {
    address: wallet.address,
    mnemonic: "", // no mnemonic from private key
    privateKey: wallet.privateKey,
  };
}

/**
 * Get wallet instance from private key
 */
export function getWalletInstance(
  privateKey: string,
  provider: ethers.Provider
): ethers.Wallet {
  return new ethers.Wallet(privateKey, provider);
}
