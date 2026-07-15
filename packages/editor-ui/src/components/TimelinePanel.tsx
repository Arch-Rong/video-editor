/**
 * @file TimelinePanel.tsx
 * @description 底部多轨时间轴：轨道名 + 片段条 + 绿色播放头。
 *
 * 交互（MVP）：
 * - 点击空白区域 → 按像素换算时间并 seek
 * - 点击片段 → 选中（高亮），属性面板随之更新
 *
 * 坐标约定：左侧轨道名栏宽 96px；内容区 `left = timelineStart * PPS`。
 */
import { getProjectDuration } from '@ve/editor-core';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../lib/cn';

/** 每秒对应多少像素（100% 缩放）；越大时间轴越「拉开」 */
const PPS = 80;

/** 多轨时间轴面板。 */
export function TimelinePanel() {
  const tracks = useEditorStore((s) => s.history.present.tracks);
  const currentTime = useEditorStore((s) => s.playback.currentTime);
  const duration = useEditorStore((s) => getProjectDuration(s.history.present));
  const selectedClipIds = useEditorStore((s) => s.selectedClipIds);
  const seek = useEditorStore((s) => s.seek);
  const selectClip = useEditorStore((s) => s.selectClip);

  // 画布至少能滚到片尾后一点空档，避免贴边难拖
  const canvasWidth = Math.max(duration + 10, 30) * PPS;
  // 播放头相对时间轴内容区左侧的像素位置
  const playheadX = currentTime * PPS;

  return (
    <div className="flex h-full flex-col bg-neutral-950">
      <div
        className="relative min-h-0 flex-1 overflow-auto"
        onClick={(e) => {
          // 点击落点换算成时间：去掉左侧轨道名宽度 96，再 / PPS
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = e.clientX - rect.left + e.currentTarget.scrollLeft - 96;
          if (x >= 0) seek(x / PPS);
        }}
      >
        <div className="relative" style={{ width: canvasWidth + 96, minHeight: '100%' }}>
          {/* 绿色播放头竖线 */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-emerald-400"
            style={{ left: 96 + playheadX }}
          />

          {tracks.map((track) => (
            <div key={track.id} className="flex h-14 border-b border-neutral-900">
              {/* 左侧粘性轨道名 */}
              <div className="sticky left-0 z-10 flex w-24 shrink-0 items-center border-r border-neutral-800 bg-neutral-950 px-2 text-xs text-neutral-400">
                {track.name}
              </div>

              {/* 右侧片段条 */}
              <div className="relative flex-1">
                {track.clips.map((clip) => (
                  <button
                    key={clip.id}
                    type="button"
                    className={cn(
                      'absolute top-2 bottom-2 overflow-hidden rounded px-2 text-left text-xs',
                      selectedClipIds.includes(clip.id)
                        ? 'bg-emerald-600/80 ring-1 ring-emerald-300'
                        : 'bg-neutral-700 hover:bg-neutral-600',
                    )}
                    style={{
                      left: clip.timelineStart * PPS,
                      width: Math.max(clip.duration * PPS, 8),
                    }}
                    onClick={(e) => {
                      // 阻止冒泡，避免点片段时同时触发背景 seek
                      e.stopPropagation();
                      selectClip(clip.id);
                    }}
                  >
                    <span className="truncate">{clip.kind}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
