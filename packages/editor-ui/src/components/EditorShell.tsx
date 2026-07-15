/**
 * @file EditorShell.tsx
 * @description 编辑器「布局骨架」：只负责区域划分，不关心每个区域塞什么业务组件。
 *
 * 布局示意：
 * ┌──────────── toolbar ────────────┐
 * │ media │ preview │ inspector     │
 * ├──────────── timeline ───────────┤
 */
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * @param toolbar 顶栏（工程名、撤销、播放等）
 * @param media 左侧素材库
 * @param preview 中间预览画布
 * @param inspector 右侧属性面板
 * @param timeline 底部时间轴
 * @param className 根节点额外样式（如撑满父容器 `h-full`）
 */
export function EditorShell({
  toolbar,
  media,
  preview,
  inspector,
  timeline,
  className,
}: {
  toolbar: ReactNode;
  media: ReactNode;
  preview: ReactNode;
  inspector: ReactNode;
  timeline: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col bg-neutral-950 text-neutral-100',
        className,
      )}
    >
      {/* 顶栏 */}
      <header className="shrink-0 border-b border-neutral-800">{toolbar}</header>

      {/* 中部三栏：左素材 / 中预览 / 右属性 */}
      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_280px]">
        <aside className="min-h-0 overflow-auto border-r border-neutral-800">
          {media}
        </aside>
        <section className="min-h-0 overflow-hidden">{preview}</section>
        <aside className="min-h-0 overflow-auto border-l border-neutral-800">
          {inspector}
        </aside>
      </div>

      {/* 底部时间轴 */}
      <footer className="h-52 shrink-0 border-t border-neutral-800">
        {timeline}
      </footer>
    </div>
  );
}
