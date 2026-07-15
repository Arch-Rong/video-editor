/**
 * @file editorStore.ts
 * @description 编辑器全局 Zustand store：工程快照、选中、播放头、撤销栈与编辑命令入口。
 *
 * UI 组件通过 `useEditorStore` 读写状态；真正改 Project 的算法在 `@ve/editor-core`。
 */
import { create } from 'zustand';
import type { Project } from '@ve/editor-schema';
import { createEmptyProject } from '@ve/editor-schema';
import {
  createHistory,
  deleteClip,
  getProjectDuration,
  pushHistory,
  redoHistory,
  renameProject,
  splitVideoClip,
  undoHistory,
  type HistoryState,
} from '@ve/editor-core';

/** 播放相关状态（不进撤销栈、不写入工程 JSON）。 */
export interface PlaybackState {
  /** 播放头当前时间（秒） */
  currentTime: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 是否正在拖动播放头（scrub）；拖动时应暂停部分昂贵计算 */
  isScrubbing: boolean;
}

/**
 * Store 对外形状。
 * - 数据字段：history / selectedClipIds / playback
 * - 命令方法：init、undo、seek、split…（组件里只调这些，不要直接改 tracks）
 */
export interface EditorStore {
  /** 撤销栈：past / present / future，present 即当前工程 */
  history: HistoryState<Project>;
  /** 当前选中的片段 id 列表（MVP 多用第一个） */
  selectedClipIds: string[];
  /** 播放头与播放状态 */
  playback: PlaybackState;

  /** 用传入工程（或空白工程）重置整个编辑器 */
  init: (project?: Project) => void;
  /** 修改工程显示名（记入历史） */
  setName: (name: string) => void;
  /** 撤销上一步工程编辑 */
  undo: () => void;
  /** 重做 */
  redo: () => void;
  /** 跳转播放头到指定秒数，并停止播放 */
  seek: (time: number) => void;
  /** 切换播放 / 暂停（预览真正播视频后续再接） */
  togglePlay: () => void;
  /** 选中某个片段；传 null 清空选中 */
  selectClip: (clipId: string | null) => void;
  /** 在播放头位置分割当前选中的视频片段 */
  splitAtPlayhead: () => void;
  /** 删除当前选中的片段 */
  removeSelected: () => void;

  /** 便捷读取：当前工程 */
  project: () => Project;
  /** 便捷读取：工程总时长（秒） */
  duration: () => number;
}

/**
 * 把「下一份工程」写回 store。
 * @param recordHistory true = 压入撤销栈；false = 只改 present（一般用于不入历史的微调）
 */
function applyProject(
  state: EditorStore,
  next: Project,
  recordHistory: boolean,
): Partial<EditorStore> {
  if (!recordHistory) {
    return { history: { ...state.history, present: next } };
  }
  return { history: pushHistory(state.history, next) };
}

/** React 组件使用的 hook：`const name = useEditorStore(s => s.history.present.name)` */
export const useEditorStore = create<EditorStore>((set, get) => ({
  history: createHistory(createEmptyProject()),
  selectedClipIds: [],
  playback: { currentTime: 0, isPlaying: false, isScrubbing: false },

  project: () => get().history.present,
  duration: () => getProjectDuration(get().history.present),

  init: (project) =>
    set({
      history: createHistory(project ?? createEmptyProject()),
      selectedClipIds: [],
      playback: { currentTime: 0, isPlaying: false, isScrubbing: false },
    }),

  setName: (name) =>
    set((state) => applyProject(state, renameProject(state.history.present, name), true)),

  undo: () => set((state) => ({ history: undoHistory(state.history) })),
  redo: () => set((state) => ({ history: redoHistory(state.history) })),

  seek: (time) =>
    set((state) => ({
      playback: {
        ...state.playback,
        currentTime: Math.max(0, Math.min(time, get().duration())),
        isPlaying: false,
      },
    })),

  togglePlay: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: !state.playback.isPlaying },
    })),

  selectClip: (clipId) =>
    set({ selectedClipIds: clipId ? [clipId] : [] }),

  splitAtPlayhead: () => {
    const { selectedClipIds, playback, history } = get();
    const clipId = selectedClipIds[0];
    // 没有选中片段则无法分割
    if (!clipId) return;
    set((state) =>
      applyProject(
        state,
        splitVideoClip(history.present, clipId, playback.currentTime),
        true,
      ),
    );
  },

  removeSelected: () => {
    const { selectedClipIds, history } = get();
    const clipId = selectedClipIds[0];
    if (!clipId) return;
    set((state) =>
      applyProject(state, deleteClip(history.present, clipId), true),
    );
    set({ selectedClipIds: [] });
  },
}));
