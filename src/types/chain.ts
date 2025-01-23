export enum ChainId {
    ETHEREUM = 1,
    ARBITRUM = 42161,
    OPTIMISM = 10,
    MANTLE = 5000,
    SEPOLIA = 11155111,
    SONIC_TESTNET = 64165,
}

export enum explorerLink {
    ETHEREUM = "https://etherscan.io/address/",
    ARBITRUM = "https://arbiscan.io/address/",
    OPTIMISM = "https://optimistic.etherscan.io/address/",
    MANTLE = "https://mantlescan.xyz/address/",
    SEPOLIA = "https://sepolia.etherscan.io/address/",
    SONIC_TESTNET = "https://testnet.soniclabs.com/",
}

export const TestnetChainId = process.env.NEXT_PUBLIC_TESTNET_ENABLED === "true"? ChainId.OPTIMISM: ChainId.SEPOLIA;