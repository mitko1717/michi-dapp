import {chainIdToHex, hexToChainId} from "../../utils/formatters";
import {ChainId, TestnetChainId} from "../../types/chain";
import {getFromMichiApi} from "../../utils/api";
import {Token} from "../../types/token";
import {MICHIURL} from "../../config/urls.config";
import {PlatformApiResponse} from "../../types/platform";
import {EvmAddress} from "../../types/address";

export const fetchTokenBalance = async (chainId: ChainId, walletAddress: EvmAddress) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_WALLET_TOKENS(chainId, walletAddress));
        return response.data.filter((token: Token) => Number(token.balance) > 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchMichiWalletPoints = async (walletAddress: EvmAddress) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_WALLET_POINTS(walletAddress));
        return response?.data?.filter((platform: PlatformApiResponse) => Number(platform?.points) !== 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchMichiWalletTokens = async (chainId: ChainId, walletAddress: EvmAddress) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_WALLET_TOKENS(chainId, walletAddress));
        return response?.data?.filter((token: Token) => Number(token.balance) > 0);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchMichiWallets = async (chainId: ChainId, address: EvmAddress) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_WALLETS(address));
        return response.data
            .filter((wallet: { chainId: string; }) => wallet.chainId !== chainIdToHex(TestnetChainId))
            .map((wallet: any) => {
                return {
                    ...wallet,
                    chainId: hexToChainId(wallet.chainId),
                };
            })
            .sort((a: any, b: any) => b.nftIndex - a.nftIndex);
    } catch (error) {
        console.error(error);
        throw error;
    }
};