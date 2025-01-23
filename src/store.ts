import {Action, configureStore, ThunkAction} from "@reduxjs/toolkit";
import tokensReducer from "./features/tokens/tokensSlice";
import pointsReducer from "./features/points/pointsSlice";
import userReducer from "./features/user/userSlice";
import walletReducer from "./features/wallet/walletSlice";
import referralsReducer from "./features/referrals/referralsSlice";
import orderReducer from "./features/orders/orderSlice";
import marketplaceReducer from "./features/marketplace/marketplaceSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      tokens: tokensReducer,
      points: pointsReducer,
      user: userReducer,
      wallet: walletReducer,
      referrals: referralsReducer,
      order: orderReducer,
      marketplace: marketplaceReducer
    }
  });
}

const store = makeStore();

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store
