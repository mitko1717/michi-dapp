import axios from "axios";
import {MICHIURL} from "../../config/urls.config";
import {EvmAddress} from "../../types/address";
import {ChainId} from "../../types/chain";
import {chainIdToHex} from "../../utils/formatters";

export enum  OrderType {
    Listing = "LISTING",
    Bid = "BID",
    Ask = "ASK"
}

export interface OrderData {
    type: OrderType;
    collection: EvmAddress;
    currency: EvmAddress;
    participant: EvmAddress;
    chainId: string;
    tokenId: number;
    amount: string;
    expiry: string;
    nonce: number;
    signature: string;
}

const config = {
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
};

export const fetchCurrentNonce = async (chainId: string, address: EvmAddress) => {
    try {
           const response = await axios.get(MICHIURL.MICHI_USER_GET_NONCE(chainId,address), config);
        return response.data;
    } catch (error) {
        console.error("Error fetching nonce: ", error);
        throw error;
    }
};

export const createOrder = async (orderData: OrderData) => {
    try {
        const updatedOrderData = {
            ...orderData,
        };
        const response = await axios.post(`${MICHIURL.MICHI_ORDER()}`, updatedOrderData, config);
        return response.data;
    } catch (error) {
        console.error("Error creating order: ", error);
        throw error;
    }
};

export const updateOrderStatus = async (chainId: ChainId, txHash: string, isCancelAll: boolean) => {
    try {
        const updatedOrderData = {
            chainId: chainIdToHex(chainId),
            hash: txHash,
            isCancelAll
        };
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await axios.post(`${MICHIURL.MICHI_ORDER_STATUS()}`, updatedOrderData, config);
        return response.data;
    } catch (error) {
        console.error("Error creating order: ", error);
        throw error;
    }
};
