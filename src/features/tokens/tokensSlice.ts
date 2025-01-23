import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {AppState} from "../../store";
import {ApprovedToken} from "../../types/token";
import {fetchApprovedTokens} from "./tokensApi";
import {ChainId} from "../../types/chain";

export interface TokensState {
    approvedTokens: ApprovedToken[];
    status: "idle" | "loading" | "failed";
}

const initialState: TokensState = {
    approvedTokens: [],
    status: "idle",
};

export const getApprovedTokens = createAsyncThunk(
    "tokens/fetchApprovedTokens",
    async (chainId: ChainId) => {
        return await fetchApprovedTokens(chainId);
    }
);

export const tokensSlice = createSlice({
    name: "tokens",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        getTokens: (state) => {
            // Do Nothing
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getApprovedTokens.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getApprovedTokens.fulfilled, (state, action) => {
                state.status = "idle";
                state.approvedTokens = action.payload;
            })
            .addCase(getApprovedTokens.rejected, (state, action) => {
                state.status = "failed";
            });
    },

});

export const {getTokens} = tokensSlice.actions;
export const selectApprovedTokens = (state: AppState) => state.tokens.approvedTokens;

export default tokensSlice.reducer;
