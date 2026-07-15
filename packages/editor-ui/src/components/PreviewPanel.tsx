/**
 * @file PreviewPanel.tsx
 * @description 中间预览区：按工程 settings 的宽高比画一个「监视器」框。
 * MVP 只显示占位与当前时间；后续在这里挂 `<video>` / 字幕叠加。
 */
import { useEditorStore } from '../store/editorStore';

/** 预览监视器面板。 */
export function PreviewPanel() {
  const settings = useEditorStore((s) => s.history.present.settings);
  const currentTime = useEditorStore((s) => s.playback.currentTime);

  // 用画布宽高比决定预览框形状（竖屏 9:16 / 横屏 16:9）
  const aspect = settings.width / settings.height;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 p-4">
      <div
        className="flex max-h-full max-w-full items-center justify-center rounded-sm bg-black shadow-inner"
        style={{
          aspectRatio: `${aspect}`,
          width: aspect >= 1 ? '100%' : undefined,
          height: aspect < 1 ? '100%' : undefined,
          maxWidth: 420,
          maxHeight: '100%',
        }}
      >
        <div className="px-4 text-center text-sm text-neutral-500">
          Preview canvas
          <div className="mt-2 tabular-nums text-xs text-neutral-600">
            t = {currentTime.toFixed(2)}s
          </div>
        </div>
      </div>
    </div>
  );
}
