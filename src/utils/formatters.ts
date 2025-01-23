import {ChainId} from "../types/chain";
import {Address} from "@ethereumjs/util";
import dayjs from "dayjs";
import {ethers} from "ethers";

export const chainIdToHex = (chainId: ChainId) => {
    return `0x${chainId.toString(16)}`
}

export const hexToChainId = (hex: string) => {
    return parseInt(hex?.slice(2), 16);
}

export const formatBalance = (balance: string | number) => {
    if (Number(balance) === 0) {
        return "0";
    }
    if (Number(balance) < 0.0001) {
        return "< 0.0001";
    }
    const _balance = Number(balance).toFixed(4);
    return Number(_balance).toLocaleString("en-US");
}

export const weiToEth = (wei: string | number, precision?: number) => {
    if(precision){
        return Number(ethers.utils.formatUnits(wei)).toFixed(precision);
    }
    return ethers.utils.formatEther(wei);
}

export const formatAddress = (
    address: Address | `0x${string}`,
    startChars: number = 6,
    endChars: number = -4
) => {
    const _address = address.toString();
    return `${_address.slice(0, startChars)}...${_address.slice(endChars)}`;
};

export function tableTimeFormatter(dateString: string): string {
    const expiryDate = dayjs(dateString);
    return expiryDate.format('MMMM D, YYYY h:mm A');
}
