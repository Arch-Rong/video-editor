/**
 * @file EditorWorkspace.tsx
 * @description 把「布局壳 + 各业务面板」组装成完整编辑器工作区。
 * Embed 层的 `<VideoEditor />` 最终渲染的就是本组件。
 */
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
  /** 打开时载入的工程；不传则 store.init 会建空白工程 */
  initialProject?: Project;
  /** 传给 EditorShell 根节点的 class */
  className?: string;
}

/**
 * 挂载时用 initialProject 初始化 store，再填满五个区域的具体面板。
 */
export function EditorWorkspace({
  initialProject,
  className,
}: EditorWorkspaceProps) {
  const init = useEditorStore((s) => s.init);

  // initialProject 引用变化时重新载入（宿主切换工程）
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
