import { useEditorStore } from '../store/editorStore';

export function InspectorPanel() {
  const selectedClipIds = useEditorStore((s) => s.selectedClipIds);
  const project = useEditorStore((s) => s.history.present);

  const selected = project.tracks
    .flatMap((t) => t.clips)
    .find((c) => c.id === selectedClipIds[0]);

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <h2 className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
        Inspector
      </h2>
      {!selected ? (
        <p className="text-sm text-neutral-500">Select a clip to edit properties.</p>
      ) : (
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-neutral-500">Kind</dt>
            <dd className="font-medium">{selected.kind}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Start</dt>
            <dd className="tabular-nums">{selected.timelineStart.toFixed(2)}s</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Duration</dt>
            <dd className="tabular-nums">{selected.duration.toFixed(2)}s</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
