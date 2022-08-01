import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { undoEnhancer } from "redux-immer-undo";

const initialState = {
    name: "DuoRouSai",
    age: "22",
    address: {
        city: "Shanghai",
    }
};

export const userSlice = createSlice({
    name: "User",
    initialState,
    reducers: {
        setUser: (state: any) => {
            state.name = "kk"
            state.age = "18"
        },
        removeUser: (state: any) => {
            return { ...initialState };
        },
        setAddress: (state: any,) => {
            state.address.city = "DongGuan"
        }
    }
});


export const { setUser, removeUser, setAddress } = userSlice.actions;

export default undoEnhancer(userSlice.reducer, {
    limit: 6,
    undoType: "@@User/UNDO", // 撤销操作类型
    redoType: "@@User/REDO", // 重做操作类型
    clearHistoryType: "@@User/CLEAR_HISTORY", // 清空历史记录类型
    include: [setUser(), removeUser(), setAddress()]
})
