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
        openMergeOption: false, // 开启该配置，会对相同路径修改的操作合并为一个操作行为
        ...option
    }

    const initialState = reducer(undefined, {})
    let History = createHistory(initialState)

    // 判断 action 是否加入撤销重做流水
    const isInclude = (actionType) => config.include.find(item => item.type === actionType) ? true : false

    return (state = initialState, action) => {
        const { type, payload } = action

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
                return History.present

            default:
                if (isInclude(type)) {
                    // 打断撤销重做操作时
                    History = clearRedoStack(History)
                    // console.log("----clearRedoStack--History----", History)
                    const [nextState, patches, inversePatches] = produceWithPatches(
                        state,
                        draft => reducer(draft, action)
                    )
                    if (config.limit && History.undoStack.length >= config.limit) {
                        History.undoStack.shift()
                    }
                    if (patches.length > 0 && inversePatches.length > 0) {
                        History = insertHistory(History, type, nextState, patches, inversePatches, config.openMergeOption)
                        console.log("----History----", History)
                    }
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
function insertHistory(history, actionType, nextState, patches, inversePatches, openMergeOption) {

    const { undoStack } = history
    const last = undoStack[undoStack.length - 1]

    // 对相同路径修改的操作合并为一个操作行为
    if (openMergeOption && last && last.actionType === actionType && last.patches.length === patches.length && patches.length > 0) {
        const isSameAllPath = patches.every((patch, index) => patch.path.join("") === last.patches[index].path.join("") && patch.op === last.patches[index].op)
        if (isSameAllPath) {
            last.patches = patches
            return {
                ...history,
                undoStack,
                present: nextState
            }
        }
    }
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
