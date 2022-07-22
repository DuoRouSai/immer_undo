// store/index.js 
import { configureStore } from "@reduxjs/toolkit";
import countReducers from "./modules/countSlice";
import userReducers from "./modules/userSlice";

export const store = configureStore({
    reducer: {
        count: countReducers,
        user: userReducers
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;