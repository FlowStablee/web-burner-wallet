import { ethers } from 'ethers';

export interface NetworkConfig {
    name: string;
    rpcUrl: string;
    chainId: number;
    symbol: string;
    explorer: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
    ethereum: {
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://eth.llamarpc.com',
        chainId: 1,
        symbol: 'ETH',
        explorer: 'https://etherscan.io',
    },
    sepolia: {
        name: 'Sepolia Testnet',
        rpcUrl: 'https://rpc.sepolia.org',
        chainId: 11155111,
        symbol: 'SepoliaETH',
        explorer: 'https://sepolia.etherscan.io',
    },
    polygon: {
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        chainId: 137,
        symbol: 'MATIC',
        explorer: 'https://polygonscan.com',
    },
    bsc: {
        name: 'BNB Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        chainId: 56,
        symbol: 'BNB',
        explorer: 'https://bscscan.com',
    },
};

/**
 * Get provider for a specific network
 */
export function getProvider(networkKey: string): ethers.JsonRpcProvider {
    const network = NETWORKS[networkKey];
    if (!network) {
        throw new Error(`Network ${networkKey} not found`);
    }

    return new ethers.JsonRpcProvider(network.rpcUrl);
}

/**
 * Get balance for an address
 */
export async function getBalance(address: string, networkKey: string): Promise<string> {
    const provider = getProvider(networkKey);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
}

/**
 * Send transaction
 */
export async function sendTransaction(
    privateKey: string,
    to: string,
    amount: string,
    networkKey: string
): Promise<string> {
    const provider = getProvider(networkKey);
    const wallet = new ethers.Wallet(privateKey, provider);

    const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
    });

    await tx.wait();
    return tx.hash;
}

/**
 * Get transaction count (nonce)
 */
export async function getTransactionCount(address: string, networkKey: string): Promise<number> {
    const provider = getProvider(networkKey);
    return await provider.getTransactionCount(address);
}
