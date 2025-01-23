import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {fetchOrders, fetchRecentlySoldOrders, OrdersRequest, OrderStatus} from "./marketplaceApi";
import {AppState} from "../../store";
import {Order} from "../../types/order";

interface CurrentOrder extends Order {
    status?: "idle" | "loading" | "failed";
}

export interface OrderState {
    orders: Order[] | null;
    recentlySoldOrders: Order[] | null;
    currentOrder: CurrentOrder | undefined;
    ordersStatus: "idle" | "loading" | "failed";
    recentlySoldOrdersStatus: "idle" | "loading" | "failed";
    error: string | null;
}

const initialState: OrderState = {
    orders: null,
    recentlySoldOrders: null,
    currentOrder: undefined,
    ordersStatus: "idle",
    recentlySoldOrdersStatus: "idle",
    error: null,
};

export const getOrders = createAsyncThunk(
    "marketplace/fetchOrders",
    async (ordersRequest: OrdersRequest) => {
        return await fetchOrders({...ordersRequest, status: OrderStatus.ACTIVE});
    }
);

export const getRecentlySoldOrders = createAsyncThunk(
    "marketplace/fetchRecentlySoldOrders",
    async (ordersRequest: OrdersRequest) => {
        return await fetchRecentlySoldOrders(ordersRequest);
    }
);

export const marketplaceSlice = createSlice({
    name: "marketplace",
    initialState,
    reducers: {
        setCurrentOrder: (state, action) => {
            const walletAddress = action.payload.toLowerCase();
            const orders = state.orders || [];
            const currentOrder = orders.find(order => String(order.wallet.wallet_address).toLowerCase() === walletAddress);
            state.currentOrder = currentOrder ? { ...currentOrder, status: "idle" } : undefined;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getOrders.pending, (state) => {
                state.ordersStatus = "loading";
                state.error = null;
            })
            .addCase(getOrders.fulfilled, (state, action) => {
                state.ordersStatus = "idle";
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(getOrders.rejected, (state, action) => {
                state.ordersStatus = "failed";
                state.error = action.error.message || "Failed to fetch orders";
            })
            .addCase(getRecentlySoldOrders.pending, (state) => {
                state.recentlySoldOrdersStatus = "loading";
                state.error = null;
            })
            .addCase(getRecentlySoldOrders.fulfilled, (state, action) => {
                state.recentlySoldOrdersStatus = "idle";
                state.recentlySoldOrders = action.payload;
                state.error = null;
            })
            .addCase(getRecentlySoldOrders.rejected, (state, action) => {
                state.recentlySoldOrdersStatus = "failed";
                state.error = action.error.message || "Failed to fetch recently sold orders";
            });
    },
});

export const { setCurrentOrder, clearCurrentOrder } = marketplaceSlice.actions;

export const selectOrders = (state: AppState) => state.marketplace.orders;
export const selectRecentlySoldOrders = (state: AppState) => state.marketplace.recentlySoldOrders;
export const selectCurrentOrder = (state: AppState) => state.marketplace.currentOrder;

export default marketplaceSlice.reducer;
