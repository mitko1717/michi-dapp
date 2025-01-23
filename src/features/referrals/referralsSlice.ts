import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {fetchUserReferralHistory, fetchUserReferralLink, postUserReferrer} from "./referralsApi";
import {AppState} from "../../store";
import {ReferredUser} from "../../types/referral";
import {Address} from "@ethereumjs/util";
import {EvmAddress} from "../../types/address";
import {ApiError, ErrorPayload, UNKNOWN_ERROR} from "../../types/errors";

export interface ReferralState {
    history: ReferredUser[];
    referralLink: string;
    numReferrals: number;
    referralPoints: string;
    status: "idle" | "loading" | "failed";
    referrerAttached?: boolean;
    referrerAttachedStatus?: "idle" | "loading" | "failed" | "success";
    referralAttachedError?: string | null;
}

const initialState: ReferralState = {
    referralLink: "",
    numReferrals: 0,
    referralPoints: "0",
    history: [],
    status: "idle",
    referrerAttached: false,
    referrerAttachedStatus: "idle",
    referralAttachedError: null
};

export const getReferralHistory = createAsyncThunk(
    "referrals/fetchUserReferralHistory",
    async (address:Address) => {
        return await fetchUserReferralHistory(address);
    }
);

export const getReferralLink = createAsyncThunk(
    "referrals/fetchUserReferralLink",
    async (address: Address) => {
        return await fetchUserReferralLink(address);
    }
);

export const attachUserReferrer = createAsyncThunk(
    "referrals/postUserReferrer",
    async ({address, affiliateId}: { address: EvmAddress, affiliateId: string }, {getState, rejectWithValue}) => {
        try {
            const state = getState() as AppState;
            const referrerAttached = state.referrals.referrerAttached;

            if (referrerAttached) {
                return;
            }

            if (localStorage.getItem("affiliateId")) {
                const _affiliateId = localStorage.getItem("affiliateId");
                return _affiliateId && await postUserReferrer(address, _affiliateId);
            }

            return await postUserReferrer(address, affiliateId);
        } catch (error) {
            if (error) {
                const axiosError = error as ApiError;
                return rejectWithValue({
                    message: axiosError?.response?.data?.message || UNKNOWN_ERROR,
                });
            }
            return rejectWithValue({
                message: UNKNOWN_ERROR
            });
        }
    }
);


export const referralsSlice = createSlice({
    name: "referrals",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getReferralHistory.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getReferralHistory.fulfilled, (state, action) => {
                state.status = "idle";
                state.history = action.payload.topReferredUsers;
                state.numReferrals = action.payload.numReferrals;
                state.referralPoints = action.payload.referralPoints;
            })
            .addCase(getReferralHistory.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(getReferralLink.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getReferralLink.fulfilled, (state, action) => {
                state.status = "idle";
                state.referralLink = action.payload.inviteLink;
            })
            .addCase(getReferralLink.rejected, (state) => {
                state.status = "failed";
            })
            .addCase(attachUserReferrer.pending, (state) => {
                state.referrerAttachedStatus = "loading";
            })
            .addCase(attachUserReferrer.fulfilled, (state) => {
                state.referrerAttached = true;
                state.referrerAttachedStatus = "success";
            })
            .addCase(attachUserReferrer.rejected, (state, action) => {
                const _payload = action?.payload as ErrorPayload;
                state.referrerAttachedStatus = "failed";
                state.referralAttachedError = _payload?.message;
            })
    },
});

export const selectReferralHistory = (state: AppState) => state.referrals.history;
export const selectReferralStatus = (state: AppState) => state.referrals.status;
export const selectReferral = (state: AppState) => state.referrals;

export default referralsSlice.reducer;
