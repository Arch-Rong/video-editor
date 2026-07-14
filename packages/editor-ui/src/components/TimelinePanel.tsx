import { getProjectDuration } from '@ve/editor-core';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../lib/cn';

const PPS = 80;

export function TimelinePanel() {
  const tracks = useEditorStore((s) => s.history.present.tracks);
  const currentTime = useEditorStore((s) => s.playback.currentTime);
  const duration = useEditorStore((s) => getProjectDuration(s.history.present));
  const selectedClipIds = useEditorStore((s) => s.selectedClipIds);
  const seek = useEditorStore((s) => s.seek);
  const selectClip = useEditorStore((s) => s.selectClip);

  const canvasWidth = Math.max(duration + 10, 30) * PPS;
  const playheadX = currentTime * PPS;

  return (
    <div className="flex h-full flex-col bg-neutral-950">
      <div
        className="relative min-h-0 flex-1 overflow-auto"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = e.clientX - rect.left + e.currentTarget.scrollLeft - 96;
          if (x >= 0) seek(x / PPS);
        }}
      >
        <div className="relative" style={{ width: canvasWidth + 96, minHeight: '100%' }}>
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-emerald-400"
            style={{ left: 96 + playheadX }}
          />
          {tracks.map((track) => (
            <div key={track.id} className="flex h-14 border-b border-neutral-900">
              <div className="sticky left-0 z-10 flex w-24 shrink-0 items-center border-r border-neutral-800 bg-neutral-950 px-2 text-xs text-neutral-400">
                {track.name}
              </div>
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
