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

export interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  isScrubbing: boolean;
}

export interface EditorStore {
  history: HistoryState<Project>;
  selectedClipIds: string[];
  playback: PlaybackState;
  init: (project?: Project) => void;
  setName: (name: string) => void;
  undo: () => void;
  redo: () => void;
  seek: (time: number) => void;
  togglePlay: () => void;
  selectClip: (clipId: string | null) => void;
  splitAtPlayhead: () => void;
  removeSelected: () => void;
  project: () => Project;
  duration: () => number;
}

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
