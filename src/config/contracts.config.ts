export const MulticallAddress = '0xca1167915584462449ee5b4ea51c37fe81ecdccd';

export enum EthereumTokenAddresses {
    USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7",
    WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
}

export enum ArbitrumTokenAddresses {
    USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
}

export enum SepoliaTokenAddresses {
    USDC = "0x898148Ed6e2dC67C076588B4C9184a274924d3e4",
    USDT = "0x898148Ed6e2dC67C076588aB4C9184a2714924d3e4",
    WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
}

interface TokenAddresses {
    USDC: string;
    USDT: string;
    WETH: string;
}

export const TokenAddressesMap: { [key: number]: TokenAddresses } = {
    1: EthereumTokenAddresses,
    42161: ArbitrumTokenAddresses,
    11155111: SepoliaTokenAddresses
};

export const ChainNameMap: { [key: number]: string } = {
    1: 'Ethereum',
    42161: 'Arbitrum',
    11155111: 'Sepolia',
    5000: 'Mantle',
};


export const TokenSymbols: { [key: string]: string } = {
    [EthereumTokenAddresses.USDC]: 'USDC',
    [EthereumTokenAddresses.USDT]: 'USDT',
    [EthereumTokenAddresses.WETH]: "WETH",
    [ArbitrumTokenAddresses.USDC]: 'USDC',
    [ArbitrumTokenAddresses.USDT]: 'USDT',
    [ArbitrumTokenAddresses.WETH]: "WETH",
    [SepoliaTokenAddresses.USDC]: 'USDC',
    [SepoliaTokenAddresses.USDT]: 'USDT',
    [SepoliaTokenAddresses.WETH]: "WETH",
};

export const TokenDecimals: { [key: string]: number } = {
    [EthereumTokenAddresses.USDC]: 6,
    [EthereumTokenAddresses.USDT]: 6,
    [EthereumTokenAddresses.WETH]: 18,
    [ArbitrumTokenAddresses.USDC]: 6,
    [ArbitrumTokenAddresses.USDT]: 6,
    [ArbitrumTokenAddresses.WETH]: 18,
    [SepoliaTokenAddresses.USDC]: 18,
    [SepoliaTokenAddresses.USDT]: 18,
    [SepoliaTokenAddresses.WETH]: 18,
};