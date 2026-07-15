/**
 * @file history.ts
 * @description 通用撤销 / 重做栈（与 Project 解耦，对任意快照类型 T 可用）。
 *
 * 模型：
 * - past：更早的快照（从旧到新）
 * - present：当前快照
 * - future：被撤销掉、可重做的快照
 *
 * 注意：push 新状态后会清空 future（和常见编辑器一致）。
 */

/** 三段式历史结构 */
export interface HistoryState<T> {
  /** 撤销栈：越靠后越接近当前 */
  past: T[];
  /** 当前状态 */
  present: T;
  /** 重做栈：撤销后的未来状态 */
  future: T[];
}

/**
 * 用初始 present 创建空历史（无 past / future）。
 * 例如：打开工程、`store.init` 时调用。
 */
export function createHistory<T>(present: T): HistoryState<T> {
  return { past: [], present, future: [] };
}

/**
 * 提交一次新的编辑结果。
 * - 把旧 present 推进 past
 * - present 换成 next
 * - 清空 future（分支变更后不能再 redo 旧路径）
 * - 若 next 与 present 是同一引用，则原样返回（避免无意义入栈）
 */
export function pushHistory<T>(state: HistoryState<T>, next: T): HistoryState<T> {
  if (Object.is(state.present, next)) return state;
  return {
    past: [...state.past, state.present],
    present: next,
    future: [],
  };
}

/**
 * 撤销一步：present ← past 最后一项；原 present 进 future。
 * past 为空时不变。
 */
export function undoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1];
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future],
  };
}

/**
 * 重做一步：present ← future 第一项；原 present 进 past。
 * future 为空时不变。
 */
export function redoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.future.length === 0) return state;
  const [next, ...rest] = state.future;
  return {
    past: [...state.past, state.present],
    present: next,
    future: rest,
  };
}
