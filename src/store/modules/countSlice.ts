import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { undoEnhancer } from "redux-immer-undo";

export interface CountState {
    value: number;
}

const initialState: CountState = {
    value: 0
};

export const countSlice = createSlice({
    name: "Count",
    initialState,
    reducers: {
        increment: (state: any, { payload }) => {
            state.value += 1;
        },
        decrement: (state: any) => {
            state.value -= 1;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(incrementByAsync.fulfilled, (state, action) => {
            state.value += action.payload;
        })
    }

});

export const incrementByAsync = createAsyncThunk(
    'count/incrementByAsync',
    async (amount: number) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return amount;
    }
)

// dispatch(incrementByAsync()) => { ... }
// dispatch(increment()) => { type:"Count/increment", payload:1 }

export const { increment, decrement } = countSlice.actions;

// export default countSlice.reducer

export default undoEnhancer(countSlice.reducer, {
    limit: 6,
    undoType: "@@Count/UNDO", // 撤销操作类型
    redoType: "@@Count/REDO", // 重做操作类型
    clearHistoryType: "@@Count/CLEAR_HISTORY", // 清空历史记录类型
    include: [increment(), decrement(), incrementByAsync.fulfilled()],
    openMergeOption: false, // 是否开启合并选项
})
