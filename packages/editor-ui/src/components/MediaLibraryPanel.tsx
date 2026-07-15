/**
 * @file MediaLibraryPanel.tsx
 * @description 左侧素材库面板。
 * MVP 只是占位 UI；后续在此上传/列表素材，并拖到时间轴上生成 Clip。
 */
/** 素材库空态占位。 */
export function MediaLibraryPanel() {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <h2 className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
        Media
      </h2>
      <p className="text-sm text-neutral-500">
        Drop assets here in a later milestone. Host apps can inject assets via
        Embed props.
      </p>
      <div className="flex flex-1 items-center justify-center rounded border border-dashed border-neutral-700 text-xs text-neutral-600">
        Empty library
      </div>
    </div>
  );
}
