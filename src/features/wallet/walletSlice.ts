import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

import type {AppState} from "../../store";
import {ChainId} from "../../types/chain";
import {fetchMichiWalletPoints, fetchMichiWallets, fetchMichiWalletTokens, fetchTokenBalance} from "./walletApi";
import {Token} from "../../types/token";
import {Wallet} from "../../types/wallet";
import {EvmAddress} from "../../types/address";
import {fetchOrders, fetchWalletOrders, OrdersRequest, WalletOrdersRequest} from "../marketplace/marketplaceApi";
import {OrderType} from "../orders/orderAPI";
import {Order} from "../../types/order";

interface CurrentWallet extends Wallet {
    tokensStatus?: "idle" | "loading" | "failed";
    pointsStatus?: "idle" | "loading" | "failed";
    status?: "idle" | "loading" | "failed";
    offerStatus?: "idle" | "loading" | "failed";
    listingsStatus?: "idle" | "loading" | "failed";
}

export interface WalletState {
    michiNfts: Wallet[];
    tokenBalance: Token[];
    currentWallet: CurrentWallet | undefined;
    status: "idle" | "loading" | "failed";
}

const initialState: WalletState = {
    michiNfts: [],
    currentWallet: undefined,
    tokenBalance: [],
    status: "idle",
};

export const getTokenBalance = createAsyncThunk(
    "wallet/fetchTokenBalance",
    async ({chainId, walletAddress}: { chainId: ChainId, walletAddress: EvmAddress }) => {
        return await fetchTokenBalance(chainId, walletAddress);
    }
);

export const getMichiWallets = createAsyncThunk(
    "wallet/fetchMichiWallets",
    async ({chainId, walletAddress}: { chainId: ChainId, walletAddress: EvmAddress }) => {
        return await fetchMichiWallets(chainId, walletAddress);
    }
);

export const getCurrentWalletTokens = createAsyncThunk(
    "wallet/fetchMichiWalletTokens",
    async ({chainId, walletAddress}: { chainId: ChainId, walletAddress: EvmAddress }) => {
        return await fetchMichiWalletTokens(chainId, walletAddress);
    }
);

export const getCurrentWalletPoints = createAsyncThunk(
    "wallet/fetchMichiWalletPoints",
    async (walletAddress: EvmAddress) => {
        return await fetchMichiWalletPoints(walletAddress);
    }
);

export const getCurrentWalletOffers = createAsyncThunk<Order[], OrdersRequest>(
    "user/fetchMichiWalletOffers",
    async ({ tokenId, chainId }) => {
        return await fetchOrders({tokenId, type: OrderType.Bid, chainId});
    }
);

export const getCurrentWalletListings = createAsyncThunk<Order[], WalletOrdersRequest>(
    "user/fetchMichiWalletListings",
    async ({tokenId, chainId}) => {
        return await fetchWalletOrders(tokenId, chainId, OrderType.Listing);
    }
);

export const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        addWallet: (state, action) => {
            let _wallets = state.michiNfts;
            _wallets.push(action.payload);
            _wallets = _wallets.sort((a: any, b: any) => b.nftIndex - a.nftIndex);
            state.michiNfts = _wallets;
        },
        getCurrentWallet: (state, action) => {
            const _wallet = state.michiNfts.find((wallet) => {
                return wallet.walletAddress.toString().toLowerCase() === action.payload.toLowerCase();
            })
            if (!_wallet) return;
            state.currentWallet = {..._wallet, status: "idle"};
        },
        setCurrentWallet: (state, action) => {
            state.currentWallet = {...state.currentWallet, ...action.payload};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTokenBalance.pending, (state) => {
                //TODO: Add loading state
            })
            .addCase(getTokenBalance.fulfilled, (state, action) => {
                state.tokenBalance = action.payload;
                //TODO: Add loading state
            })
            .addCase(getTokenBalance.rejected, (state) => {
                //TODO: Add loading state
            })
            .addCase(getMichiWallets.pending, (state) => {
            state.status = "loading";
            state.michiNfts = [];
            })
            .addCase(getMichiWallets.fulfilled, (state, action) => {
                state.status = "idle";
                state.michiNfts = action.payload;
            })
            .addCase(getMichiWallets.rejected, (state) => {
                state.status = "failed";
                state.michiNfts = [];
            })
            .addCase(getCurrentWalletPoints.pending, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.pointsStatus = "loading";
                }
            })
            .addCase(getCurrentWalletPoints.fulfilled, (state, action) => {
                if (state.currentWallet) {
                    state.currentWallet.points = action.payload;
                    state.currentWallet.pointsStatus = "idle";
                }
            })
            .addCase(getCurrentWalletPoints.rejected, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.pointsStatus = "failed";
                }
            })
            .addCase(getCurrentWalletTokens.pending, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.tokensStatus = "loading";
                }
            })
            .addCase(getCurrentWalletTokens.fulfilled, (state, action) => {
                if (state.currentWallet) {
                    state.currentWallet.tokens = action.payload;
                    state.currentWallet.tokensStatus = "idle";
                }
            })
            .addCase(getCurrentWalletTokens.rejected, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.tokensStatus = "failed";
                }
            })
            .addCase(getCurrentWalletOffers.pending, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.offerStatus = "loading";
                }
            })
            .addCase(getCurrentWalletOffers.fulfilled, (state, action) => {
                if (state.currentWallet) {
                    state.currentWallet.offers = action.payload;
                    state.currentWallet.offerStatus = "idle";
                }
            })
            .addCase(getCurrentWalletOffers.rejected, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.offerStatus = "failed";
                }
            })
            .addCase(getCurrentWalletListings.pending, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.listingsStatus = "loading";
                }
            })
            .addCase(getCurrentWalletListings.fulfilled, (state, action) => {
                if (state.currentWallet) {
                    state.currentWallet.listings = action.payload;
                    state.currentWallet.listingsStatus = "idle";
                }
            })
            .addCase(getCurrentWalletListings.rejected, (state) => {
                if (state.currentWallet) {
                    state.currentWallet.listingsStatus = "failed";
                }
            });
    },
});


export const {
    addWallet,
    getCurrentWallet,
    setCurrentWallet,
} = walletSlice.actions;

export const selectTokenBalance = (state: AppState) => state.wallet.tokenBalance;
export const selectMichiWallets = (state: AppState) => state.wallet.michiNfts;

export default walletSlice.reducer;
