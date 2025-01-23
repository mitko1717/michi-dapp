import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {createOrder,  OrderData} from "./orderAPI";
import type { AppState } from '../../store';

export interface OrderState {
    data: any;
    status: 'idle' | 'loading' | 'failed';
    ordersStatus: 'idle' | 'loading' | 'failed';
    error: string | null;
}

const initialState: OrderState = {
    data: null,
    status: 'idle',
    ordersStatus: 'idle',
    error: null,
};

export const createNewOrder = createAsyncThunk(
    'order/createNewOrder',
    async (orderData: OrderData) => {
        return await createOrder(orderData);
    }
);

export const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createNewOrder.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createNewOrder.fulfilled, (state, action) => {
                state.status = 'idle';
                state.data = action.payload;
            })
            .addCase(createNewOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? 'Unknown error';
            });
    },
});

export const selectOrder = (state: AppState) => state.order;
export default orderSlice.reducer;