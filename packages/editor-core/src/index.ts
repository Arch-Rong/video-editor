/**
 * @file index.ts
 * @description `@ve/editor-core` 对外导出入口。
 * 本包只有纯逻辑，禁止依赖 React / DOM。
 */
export { getProjectDuration, touchProject } from './duration';
export { splitVideoClip, deleteClip, renameProject } from './clipOps';
export {
  createHistory,
  pushHistory,
  undoHistory,
  redoHistory,
  type HistoryState,
} from './history';
