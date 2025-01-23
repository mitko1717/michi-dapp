import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchLeaderboardPoints } from "./pointsApi";
import { LeaderboardUser } from "../../types/leaderboard";
import { AppState } from "../../store";

export interface PointsState {
    leaderboard: LeaderboardUser[];
    status: "idle" | "loading" | "failed";
    offset: number;
}

const initialState: PointsState = {
    leaderboard: [],
    status: "idle",
    offset: 0,
};

export const getLeaderboardPoints = createAsyncThunk(
    "points/fetchLeaderboardPoints",
    async (offset: number = 0) => {
        const users = await fetchLeaderboardPoints(offset);
        return { users, offset };
    }
);

export const pointsSlice = createSlice({
    name: "points",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getLeaderboardPoints.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getLeaderboardPoints.fulfilled, (state, action) => {
                state.status = "idle";
                if (action.payload.offset === 0) {
                    state.leaderboard = action.payload.users;
                } else {
                    state.leaderboard = [...state.leaderboard, ...action.payload.users];
                }
                state.offset = action.payload.offset + action.payload.users.length;
            })
            .addCase(getLeaderboardPoints.rejected, (state) => {
                state.status = "failed";
            });
    },
});

export const selectLeaderboard = (state: AppState) => state.points.leaderboard;
export const selectPointsStatus = (state: AppState) => state.points.status;
export const selectOffset = (state: AppState) => state.points.offset;

export default pointsSlice.reducer;
