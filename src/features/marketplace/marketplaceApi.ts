import axios from "axios";
import {MICHIURL} from "../../config/urls.config";
import {axiosGetConfig} from "../../config/axios.config";
import {OrderType} from "../orders/orderAPI";
import {EvmAddress} from "../../types/address";
import {Address} from "@ethereumjs/util";

export enum OrderStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    PROCESSING_CANCELLATION = "PROCESSING_CANCELLATION"
}

export interface OrdersRequest {
    type?: OrderType;
    participant?: EvmAddress;
    chainId?: string;
    tokenId?: number;
    collection?: EvmAddress;
    nonce?: number;
    ownerAddress?: EvmAddress;
    status?: OrderStatus;
    isStale?: "true" | "false";
}

export interface WalletOrdersRequest {
    type: OrderType;
    chainId: string;
    tokenId: number;
}

export interface SoldOrdersRequest {
    buyer?: EvmAddress;
    seller?: EvmAddress;
    chainId?: string;
    tokenId?: number;
    collection?: EvmAddress;
    points?: string[];
    startDate?: number;
    endDate?: number;
}


export const fetchOrders = async (ordersRequest: OrdersRequest) => {
    try {
        const params: any = {};
        if (ordersRequest.type) params.type = ordersRequest.type;
        if (ordersRequest.participant) if (!(ordersRequest.participant instanceof Address)) {
            params.participant = ordersRequest.participant.toLowerCase();
        }
        if (ordersRequest.ownerAddress) if (!(ordersRequest.ownerAddress instanceof Address)) {
            params.ownerAddress = ordersRequest.ownerAddress.toLowerCase();
        }
        if (ordersRequest.chainId) params.chainId = ordersRequest.chainId;
        if (ordersRequest.isStale) params.isStale = ordersRequest.isStale;
        if (ordersRequest.status !== undefined || ordersRequest.status !== null) params.status = ordersRequest.status;
        if (ordersRequest.tokenId) params.tokenId = ordersRequest.tokenId;
        if (ordersRequest.collection) if (!(ordersRequest.collection instanceof Address)) {
            params.collection = ordersRequest.collection.toLowerCase();
        }
        if (ordersRequest.nonce) params.nonce = ordersRequest.nonce;
        const response = await axios.get(MICHIURL.MICHI_ORDERS(), {
            ...axiosGetConfig,
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders: ", error);
        throw error;
    }
};

export const fetchWalletOrders = async (tokenId: number, chainId: string, type: OrderType) => {
    try {
        const params: any = {};
        params.type = type;

        const response = await axios.get(MICHIURL.MICHI_WALLET_ORDERS(chainId, tokenId), {
            ...axiosGetConfig,
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching wallet orders: ", error);
        throw error;
    }
};

export const fetchRecentlySoldOrders = async (ordersRequest: SoldOrdersRequest) => {
    try {
        const params: any = {};
        if (ordersRequest.buyer) params.buyer = ordersRequest.buyer;
        if (ordersRequest.seller) params.seller = ordersRequest.seller;
        if (ordersRequest.chainId) params.chainId = ordersRequest.chainId;
        if (ordersRequest.tokenId) params.tokenId = ordersRequest.tokenId;
        if (ordersRequest.collection) params.collection = ordersRequest.collection;
        if (ordersRequest.points) params.points = ordersRequest.points.join(',');
        if (ordersRequest.startDate) params.startDate = ordersRequest.startDate;
        if (ordersRequest.endDate) params.endDate = ordersRequest.endDate;

        const response = await axios.get(MICHIURL.MICHI_SALES(), {
            ...axiosGetConfig,
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders: ", error);
        throw error;
    }
};