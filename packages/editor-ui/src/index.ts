/**
 * @file index.ts
 * @description `@ve/editor-ui` 对外导出入口。
 * 宿主一般应走 `@ve/editor-embed`；需要拆组件时才直接从本包 import。
 */
export { EditorWorkspace, type EditorWorkspaceProps } from './components/EditorWorkspace';
export { EditorShell } from './components/EditorShell';
export { useEditorStore } from './store/editorStore';
export { cn } from './lib/cn';
