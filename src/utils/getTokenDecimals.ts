import {ethers, providers} from "ethers";
import {DefaultTokenABI} from "../abis/tokens";

export const getTokenDecimals = async (provider: providers.Provider, tokenAddress: `0x${string}` ): Promise<number> => {
    const contract = new ethers.Contract(tokenAddress?.toString(), DefaultTokenABI, provider);
    return await contract.decimals();
};
