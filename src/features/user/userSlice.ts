import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

import type {AppState} from "../../store";
import {fetchUserInfo} from "./userAPI";
import {UserApiResponse} from "../../types/oldRemoveLater/user";
import {Address} from "@ethereumjs/util";
import {fetchOrders, OrdersRequest, OrderStatus} from "../marketplace/marketplaceApi";
import {OrderType} from "../orders/orderAPI";
import {Order} from "../../types/order";

export interface UserState {
    points: string;
    rank: number | null;
    termsAccepted: boolean | null;
    betaAuthorized: boolean | null;
    data: UserApiResponse | null;
    theme: "light" | "dark";
    status: "idle" | "loading" | "failed";
    sentOffers: Order[] | null;
    receivedOffers: Order[] | null;
    listings: Order[] | null;
    sentOffersStatus: "idle" | "loading" | "failed";
    receivedOffersStatus: "idle" | "loading" | "failed";
    listingsStatus: "idle" | "loading" | "failed";
    error: string | null;
    stakeOrUnstakeTriggered: number
}

const initialState: UserState = {
    points: "0",
    rank: 0,
    data: null,
    termsAccepted: false,
    betaAuthorized: false,
    theme: "light",
    status: "idle",
    sentOffers: null,
    receivedOffers: null,
    listings: null,
    sentOffersStatus: "idle",
    receivedOffersStatus: "idle",
    listingsStatus: "idle",
    error: null,
    stakeOrUnstakeTriggered: Date.now()
};

export const getUserInfo = createAsyncThunk(
    "user/fetchUserInfo",
    async (address: Address) => {
        return await fetchUserInfo(address);
    }
);

export const getUserSentOffers = createAsyncThunk<Order[], OrdersRequest>(
    "user/fetchUserSentOffers",
    async ({ participant, chainId }) => {
        return await fetchOrders({participant, type: OrderType.Bid, chainId, status: OrderStatus.ACTIVE});
    }
);

export const getUserReceivedOffers = createAsyncThunk<Order[], OrdersRequest>(
    "user/fetchUserReceivedOffers",
    async ({ participant, chainId }) => {
        return await fetchOrders({ownerAddress: participant, type: OrderType.Bid, chainId, status: OrderStatus.ACTIVE});
    }
);

export const getUserListings = createAsyncThunk<Order[], OrdersRequest>(
    "user/fetchUserListings",
    async ({ participant, chainId }) => {
        return await fetchOrders({ participant, type: OrderType.Listing, chainId, status: OrderStatus.ACTIVE});
    }
);

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        acceptTerms: (state) => {
            localStorage.setItem("termsAccepted", JSON.stringify(true));
            state.termsAccepted = true;
        },
        authorizeBeta: (state) => {
            localStorage.setItem("betaAuthorized", JSON.stringify(true));
            state.termsAccepted = true;
        },
        getTermsAccepted: (state) => {
            state.termsAccepted = JSON.parse(localStorage.getItem("termsAccepted") || "false");
        },
        getBetaAuthorization: (state) => {
            state.betaAuthorized = JSON.parse(localStorage.getItem("betaAuthorized") || "false");
        },
        getTheme: (state) => {
            state.theme = localStorage.getItem("theme") as "light" | "dark" || "light";
        },
        setTheme: (state, action) => {
            localStorage.setItem("theme", action.payload);
            state.theme = action.payload;
        },
        setTokens: (state, action) => {
            if (state?.data?.redTokens) {
                state.data.redTokens = action.payload.redTokens;
                state.data.blueTokens = action.payload.blueTokens;
            }
        },
        triggerStakeOrUnstake: (state) => {
            state.stakeOrUnstakeTriggered = Date.now()
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserInfo.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getUserInfo.fulfilled, (state, action) => {
                state.status = "idle";
                Object.assign(state, action.payload);
            })
            .addCase(getUserInfo.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Failed to fetch user info";
            })
            .addCase(getUserSentOffers.pending, (state) => {
                state.sentOffersStatus = "loading";
                state.error = null;
            })
            .addCase(getUserSentOffers.fulfilled, (state, action) => {
                state.sentOffersStatus = "idle";
                state.sentOffers = action.payload;
                state.error = null;
            })
            .addCase(getUserSentOffers.rejected, (state, action) => {
                state.sentOffersStatus = "failed";
                state.error = action.error.message || "Failed to fetch user sent offers";
            })
            .addCase(getUserReceivedOffers.pending, (state) => {
                state.receivedOffersStatus = "loading";
                state.error = null;
            })
            .addCase(getUserReceivedOffers.fulfilled, (state, action) => {
                state.receivedOffersStatus = "idle";
                state.receivedOffers = action.payload;
                state.error = null;
            })
            .addCase(getUserReceivedOffers.rejected, (state, action) => {
                state.receivedOffersStatus = "failed";
                state.error = action.error.message || "Failed to fetch user received offers";
            })
            .addCase(getUserListings.pending, (state) => {
                state.listingsStatus = "loading";
                state.error = null;
            })
            .addCase(getUserListings.fulfilled, (state, action) => {
                state.listingsStatus = "idle";
                state.listings = action.payload;
                state.error = null;
            })
            .addCase(getUserListings.rejected, (state, action) => {
                state.listingsStatus = "failed";
                state.error = action.error.message || "Failed to fetch user listings";
            });
    },
});

export const {
    acceptTerms,
    getTermsAccepted,
    getBetaAuthorization,
    authorizeBeta,
    getTheme,
    setTheme,
    setTokens,
    triggerStakeOrUnstake
} = userSlice.actions;

export const selectUser = (state: AppState) => state.user;
export const selectUserSentOffers = (state: AppState) => state.user.sentOffers;
export const selectUserReceivedOffers = (state: AppState) => state.user.receivedOffers;
export const selectUserListings = (state: AppState) => state.user.listings;

export default userSlice.reducer;
