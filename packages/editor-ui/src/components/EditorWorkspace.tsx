import { useEffect } from 'react';
import type { Project } from '@ve/editor-schema';
import { EditorShell } from './EditorShell';
import { EditorToolbar } from './EditorToolbar';
import { InspectorPanel } from './InspectorPanel';
import { MediaLibraryPanel } from './MediaLibraryPanel';
import { PreviewPanel } from './PreviewPanel';
import { TimelinePanel } from './TimelinePanel';
import { useEditorStore } from '../store/editorStore';

export interface EditorWorkspaceProps {
  initialProject?: Project;
  className?: string;
}

export function EditorWorkspace({
  initialProject,
  className,
}: EditorWorkspaceProps) {
  const init = useEditorStore((s) => s.init);

  useEffect(() => {
    init(initialProject);
  }, [init, initialProject]);

  return (
    <EditorShell
      className={className}
      toolbar={<EditorToolbar />}
      media={<MediaLibraryPanel />}
      preview={<PreviewPanel />}
      inspector={<InspectorPanel />}
      timeline={<TimelinePanel />}
    />
  );
}
