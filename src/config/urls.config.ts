import {chainIdToHex} from "../utils/formatters";
import {ChainId} from "../types/chain";
import {EvmAddress} from "../types/address";

const USER_INFO = (address: EvmAddress) => {
    return `v1/points/${address}/michi`;
};

const MICHI_WALLETS = (address: EvmAddress) => {
    return `v1/nft/${address}`;
};

const MICHI_WALLET_TOKENS = (chainId: ChainId, walletAddress: EvmAddress) => {
    return `v1/tokens/${chainIdToHex(chainId)}/${walletAddress}`;
};
const MICHI_WALLET_POINTS = (walletAddress: EvmAddress) => {
    return `v1/points/${walletAddress}`;
};

const MICHI_USER_REFERRAL_HISTORY = (walletAddress: EvmAddress) => {
    return `v1/user/${walletAddress}/affiliate`;
};

const MICHI_USER_GET_REFERRAL = (walletAddress: EvmAddress) => {
    return `v1/user/${walletAddress}/affiliate/link`;
};

const MICHI_USER_ATTACH_REFERRER = () => {
    return `v1/user/`;
};

const MICHI_POINTS_LEADERBOARD = (limit: number, offset: number) => {
    return `v1/points/leaderboard/michi?limit=${limit}&offset=${offset}`;
};

const MICHI_APPROVED_TOKENS = (chainId: ChainId) => {
    return `v1/tokens/${chainIdToHex(chainId)}`;
};

const MICHI_ORDER = () => {
    return `/v1/marketplace/order`;
};

const MICHI_ORDER_STATUS = () => {
    return `/v1/marketplace/cancel`;
};

const MICHI_ORDERS = () => {
    return `/v1/marketplace/orders`;
};

const MICHI_WALLET_ORDERS = (chainId: string, tokenId: number) => {
    return `/v1/marketplace/orders/${chainId}/${tokenId}`;
};

const MICHI_LP_APY = () => {
    return `/v1/tokens/apy/0xaa36a7/0`;
};

const MICHI_SALES = () => {
    return `/v1/marketplace/sales`;
};

const MICHI_USER_GET_NONCE = (chainId: string, address: EvmAddress) => {
    return `/v1/user/${chainId}/${address}/nonce`;
};

const MICHI_USER_GET_CLAIM_DETAILS = (address: EvmAddress) => {
    return `/v1/tge/claim/${address}`;
};

export const MICHIURL = {
    USER_INFO,
    MICHI_WALLETS,
    MICHI_APPROVED_TOKENS,
    MICHI_USER_ATTACH_REFERRER,
    MICHI_WALLET_TOKENS,
    MICHI_WALLET_POINTS,
    MICHI_USER_REFERRAL_HISTORY,
    MICHI_USER_GET_REFERRAL,
    MICHI_POINTS_LEADERBOARD,
    MICHI_ORDER,
    MICHI_ORDERS,
    MICHI_USER_GET_NONCE,
    MICHI_SALES,
    MICHI_WALLET_ORDERS,
    MICHI_ORDER_STATUS,
    MICHI_USER_GET_CLAIM_DETAILS,
    MICHI_LP_APY
};