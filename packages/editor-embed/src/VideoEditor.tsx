import { useEffect, useRef } from 'react';
import type { Project } from '@ve/editor-schema';
import { EditorWorkspace, useEditorStore } from '@ve/editor-ui';

/**
 * VideoEditor 对外 props（给 Muse / 独立 Demo 等宿主用）。
 */
export interface VideoEditorProps {
  /** 已有工程 JSON；不传则内部创建空白竖屏工程（默认 1080x1920、30fps）。 */
  initialProject?: Project;
  /** 根节点额外 class，常用于撑满宿主容器，如 `h-full`。 */
  className?: string;
  /**
   * 工程内容变化时回调（当前为每次 present 变更立刻触发）。
   * 宿主可在这里持久化；若改动很频繁，建议宿主侧自行防抖。
   */
  onChange?: (project: Project) => void;
  /** 预留：关闭编辑器（当前 UI 尚未接关闭按钮）。 */
  onClose?: () => void;
}

/**
 * 视频编辑器的宿主入口组件。
 *
 * 职责很薄，只做三件事：
 * 1. 把 `initialProject` / `className` 交给内部工作区 `EditorWorkspace`
 * 2. 订阅 Zustand 里的当前工程快照
 * 3. 工程变更时通过 `onChange` 通知宿主
 *
 * Muse 等外部应用应只依赖本包（`@ve/editor-embed`），
 * 不要直接引用 `@ve/editor-ui` 内部实现。
 */
export function VideoEditor({
  initialProject,
  className,
  onChange,
}: VideoEditorProps) {
  // 从全局编辑器 store 取出「当前工程」（撤销栈里的 present）
  const project = useEditorStore((s) => s.history.present);

  // 用 ref 存最新 onChange，避免把它放进 effect 依赖导致反复订阅
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 工程对象一变就通知宿主（含首次挂载时的初始工程）
  useEffect(() => {
    onChangeRef.current?.(project);
  }, [project]);

  // 真正的编辑器壳（顶栏 / 素材 / 预览 / 属性 / 时间轴）在 ui 包里
  return (
    <EditorWorkspace initialProject={initialProject} className={className} />
  );
}
