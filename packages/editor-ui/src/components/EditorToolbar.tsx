/**
 * @file EditorToolbar.tsx
 * @description 顶栏：工程名、撤销/重做、分割/删除、播放按钮、时间码与画布分辨率。
 */
import type { ReactNode } from 'react';
import { Pause, Play, Redo2, Scissors, Trash2, Undo2 } from 'lucide-react';
import { getProjectDuration } from '@ve/editor-core';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../lib/cn';

/** 把秒数格式化成 `分:秒.百分秒`，方便顶栏时间显示。 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

/** 编辑器顶部工具条。 */
export function EditorToolbar() {
  const name = useEditorStore((s) => s.history.present.name);
  const currentTime = useEditorStore((s) => s.playback.currentTime);
  const isPlaying = useEditorStore((s) => s.playback.isPlaying);
  const duration = useEditorStore((s) => getProjectDuration(s.history.present));
  const settings = useEditorStore((s) => s.history.present.settings);
  const setName = useEditorStore((s) => s.setName);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const togglePlay = useEditorStore((s) => s.togglePlay);
  const splitAtPlayhead = useEditorStore((s) => s.splitAtPlayhead);
  const removeSelected = useEditorStore((s) => s.removeSelected);

  return (
    <div className="flex h-12 items-center gap-3 px-3">
      {/* 工程名输入框 */}
      <input
        className="w-48 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm outline-none focus:border-emerald-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Project name"
      />

      {/* 常用编辑命令 */}
      <div className="flex items-center gap-1">
        <IconButton label="Undo" onClick={undo}>
          <Undo2 size={16} />
        </IconButton>
        <IconButton label="Redo" onClick={redo}>
          <Redo2 size={16} />
        </IconButton>
        <IconButton label="Split" onClick={splitAtPlayhead}>
          <Scissors size={16} />
        </IconButton>
        <IconButton label="Delete" onClick={removeSelected}>
          <Trash2 size={16} />
        </IconButton>
      </div>

      {/* 右侧：播放 + 时间码 + 分辨率 */}
      <div className="ml-auto flex items-center gap-3 text-xs text-neutral-400">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded bg-neutral-800 hover:bg-neutral-700"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <span className="tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <span>
          {settings.width}x{settings.height} · {settings.fps}fps
        </span>
      </div>
    </div>
  );
}

/** 顶栏小图标按钮（无障碍：aria-label + title）。 */
function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded text-neutral-300',
        'hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
      )}
    >
      {children}
    </button>
  );
}
