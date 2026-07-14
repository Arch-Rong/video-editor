import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

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
      <header className="shrink-0 border-b border-neutral-800">{toolbar}</header>
      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_280px]">
        <aside className="min-h-0 overflow-auto border-r border-neutral-800">
          {media}
        </aside>
        <section className="min-h-0 overflow-hidden">{preview}</section>
        <aside className="min-h-0 overflow-auto border-l border-neutral-800">
          {inspector}
        </aside>
      </div>
      <footer className="h-52 shrink-0 border-t border-neutral-800">
        {timeline}
      </footer>
    </div>
  );
}
