/* 可插拔的撤销重做插件 */
import { enablePatches, produceWithPatches, applyPatches } from "immer"

// 启用对 Patches 的支持
enablePatches()

export const undoEnhancer = (reducer, option = {}) => {

    const config = {
        limit: false, // 日志流水最大长度, 默认false为不限制
        undoType: "@@undoEnhancer/UNDO", // 撤销操作类型
        redoType: "@@undoEnhancer/REDO", // 重做操作类型
        clearHistoryType: "@@undoEnhancer/CLEAR_HISTORY", // 清空历史记录类型
        include: [], // 需要加入日志流水的操作类型
        ...option
    }

    const initialState = reducer(undefined, {})
    let History = createHistory(initialState)

    // 判断 action 是否加入撤销重做流水
    const isInclude = (actionType) => config.include.find(item => item.type === actionType) ? true : false

    return (state = initialState, action) => {
        const { type, payload } = action
        console.log(type);
        switch (type) {
            case config.undoType:
                // 撤销操作
                if (History.undoStack.length <= 0) {
                    return History.present
                }
                History = undoOption(History)
                return History.present

            case config.redoType:
                // 重做操作
                if (History.redoStack.length <= 0) {
                    return History.present
                }
                History = redoOption(History)
                return History.present

            case config.clearHistoryType:
                // 清空历史记录
                History = clearHistory(History)
                console.log(History);
                return History.present

            default:
                // 打断撤销重做操作时
                History = clearRedoStack(History)

                if (isInclude(type)) {
                    const [nextState, patches, inversePatches] = produceWithPatches(
                        state,
                        draft => reducer(draft, action)
                    )
                    if (config.limit && History.undoStack.length >= config.limit) {
                        History.undoStack.shift()
                    }
                    History = insertHistory(History, type, nextState, patches, inversePatches)
                    console.log("----History----", History)
                    return nextState
                }
                return reducer(state, action)
        }

    }
}

// 创建历史堆栈
function createHistory(present = null) {
    return {
        undoStack: [],
        redoStack: [],
        present,
    }
}

// 清空历史记录
function clearHistory(history) {
    return {
        ...history,
        undoStack: [],
        redoStack: [],
    }
}

// 特殊情况: 打断撤销重做操作时，清空 redoStack
function clearRedoStack(history) {
    return {
        ...history,
        redoStack: [],
    }
}

// 推入撤销重做记录
function insertHistory(history, actionType, nextState, patches, inversePatches) {
    return {
        ...history,
        undoStack: [...history.undoStack, { actionType, patches, inversePatches }],
        present: nextState,
    }
}

// 撤销操作
function undoOption(history) {
    const { undoStack, present } = history
    const { patches, inversePatches, actionType } = undoStack.pop()
    const nextState = applyPatches(present, inversePatches)
    return {
        ...history,
        redoStack: [...history.redoStack, { actionType, patches, inversePatches }],
        present: nextState,
    }
}

// 重做操作
function redoOption(history) {
    const { redoStack, present } = history
    const { patches, inversePatches, actionType } = redoStack.pop()
    const nextState = applyPatches(present, patches)
    return {
        ...history,
        undoStack: [...history.undoStack, { actionType, patches, inversePatches }],
        present: nextState,
    }
}


