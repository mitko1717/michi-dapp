import {Address} from "@ethereumjs/util";
import {ChainId, explorerLink} from "../types/chain";
import {Token} from "../types/token";
import {EvmAddress} from "../types/address";

export const getActualBalance = (token: Token): number => {
    const balance = parseInt(token.balance);
    const decimals = token.decimals;
    return balance / Math.pow(10, decimals);
}

export const explorerLinkMap = {
    [ChainId.ETHEREUM]: explorerLink.ETHEREUM,
    [ChainId.ARBITRUM]: explorerLink.ARBITRUM,
    [ChainId.OPTIMISM]: explorerLink.OPTIMISM,
    [ChainId.MANTLE]: explorerLink.MANTLE,
    [ChainId.SEPOLIA]: explorerLink.SEPOLIA,
};

export const getExplorerLink = (chainId: ChainId, address: Address | EvmAddress| undefined ): string => {
    const link = explorerLinkMap[chainId] || explorerLink.ETHEREUM; // default to Ethereum if chainId is not recognized
    return `${link}${address}`;
}

export const getShortUrl = (transaction: { link: string | URL; }) => {
    const url = new URL(transaction?.link);
    const txHash = url.pathname.replace("/tx/", "");
    const shortHash = `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`;
    return `${url.hostname}/${shortHash}`;
};

export function decodeEthereumLog(data: any) {
    try {
        const address = data[3].address;
        const hexString = data[data.length - 1].data;
        const hexData = hexString.startsWith("0x") ? hexString.substring(2) : hexString;

        const numericValueHex = "0x" + hexData.substring(64);
        const numericValue = BigInt(numericValueHex);

        return {
            address: address as unknown as Address,
            nftId: numericValue.toString()
        };
    } catch (error) {
        console.error(error);
        return {
            address: "",
            nftId: ""
        };
    }
}