# 数据模型

本文定义工程存档（Project JSON）的逻辑结构。实现可用 Zod / JSON Schema 固化，并做版本迁移。

## 1. 顶层 Project

```ts
interface Project {
  schemaVersion: number;          // 从 1 起，破坏性变更递增
  id: string;
  name: string;
  createdAt: string;              // ISO
  updatedAt: string;
  settings: ProjectSettings;
  assets: Record<string, Asset>;  // assetId -> Asset
  tracks: Track[];
  // 可选：全局标记、章节、素材柜视图状态等不进入成片的数据可另存 uiState
}
```

### ProjectSettings

```ts
interface ProjectSettings {
  width: number;          // e.g. 1080
  height: number;         // e.g. 1920
  fps: number;            // e.g. 30
  durationHint?: number;  // 可选，真实时长由 tracks 推算
  backgroundColor?: string;
}
```

## 2. Asset（素材）

```ts
type AssetType = 'video' | 'image' | 'audio' | 'font' | 'lut' | 'sticker';

interface Asset {
  id: string;
  type: AssetType;
  name: string;
  src: string;                 // 可播放 / 可下载 URL
  proxySrc?: string;           // 预览代理
  duration?: number;           // 秒；图片可无
  width?: number;
  height?: number;
  mimeType?: string;
  thumbnail?: string;
  meta?: Record<string, unknown>;
}
```

原则：Track 上的 Clip **引用** `assetId`，不内嵌大文件。

## 3. Track / Clip

```ts
type TrackType = 'video' | 'audio' | 'text' | 'overlay' | 'effect';

interface Track {
  id: string;
  type: TrackType;
  name: string;
  locked?: boolean;
  muted?: boolean;
  hidden?: boolean;
  clips: Clip[];
}
```

### 通用 Clip 基类

```ts
interface ClipBase {
  id: string;
  trackId: string;
  /** 时间轴起始（秒） */
  timelineStart: number;
  /** 时间轴上占用时长（秒） */
  duration: number;
}
```

### VideoClip

对齐现有剪辑板字段，正式命名略作规范化：

```ts
interface VideoClip extends ClipBase {
  kind: 'video';
  assetId: string;
  /** 源素材内入点（秒） —— 对应现有 sourceStart */
  sourceIn: number;
  /** 源素材内出点（秒）；通常 = sourceIn + duration * speed */
  sourceOut: number;
  speed?: number;              // 默认 1
  volume?: number;             // 0–1
  muted?: boolean;
  opacity?: number;            // 0–1
  transform?: Transform2D;
  crop?: CropRect;
  filters?: FilterParams[];
  transitionInId?: string;
  transitionOutId?: string;
}
```

> 兼容备注：现有 `VideoClip.sourceStart` ≡ 新模型 `sourceIn`；现有模型多数时候不存 `sourceOut`，导出时用 `sourceIn + duration` 推导。

### AudioClip

```ts
interface AudioClip extends ClipBase {
  kind: 'audio';
  assetId: string;
  sourceIn: number;
  sourceOut: number;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
}
```

### TextClip

```ts
interface TextClip extends ClipBase {
  kind: 'text';
  text: string;
  style: TextStyle;
  transform?: Transform2D;
}
```

```ts
interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  align?: 'left' | 'center' | 'right';
  fontWeight?: number | string;
  lineHeight?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
}
```

### OverlayClip

```ts
interface OverlayClip extends ClipBase {
  kind: 'overlay';
  assetId: string;            // image / sticker
  transform?: Transform2D;
  opacity?: number;
}
```

### 联合类型

```ts
type Clip = VideoClip | AudioClip | TextClip | OverlayClip;
```

## 4. Transform / Crop / Keyframe

```ts
interface Transform2D {
  x: number;          // 画布坐标，原点约定为画布中心或左上（实现选定后写死）
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;   // 度
}

interface CropRect {
  x: number;          // 相对源 0–1 或像素；项目内统一一种
  y: number;
  width: number;
  height: number;
}

interface Keyframe<T> {
  time: number;       // 相对 clip 本地时间 0..duration
  value: T;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}
```

关键帧可不在 MVP 落库完整泛型；v1 建议先支持 `transform` 与 `opacity` 两类。

## 5. Transition

```ts
interface Transition {
  id: string;
  type: 'fade' | 'dissolve' | string;
  duration: number;
  // 绑定方式二选一：挂在 clip 上，或作为独立 track item
}
```

MVP 推荐：转场 ID 挂在 `VideoClip.transitionOutId`，渲染时读取预设参数。

## 6. 时间轴快照与历史

```ts
/** 进入撤销栈的不可变工程切片（可忽略临时 UI 字段） */
type ProjectSnapshot = Project;

interface HistoryState {
  past: ProjectSnapshot[];
  present: ProjectSnapshot;
  future: ProjectSnapshot[];
}
```

**不要**把 `filmstripFrames` blob URL 写入持久化 Project 或历史（仅运行时缓存）。

## 7. 播放态（非持久化）

```ts
interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  isScrubbing: boolean;
  loop?: boolean;
}
```

```ts
interface SelectionState {
  selectedClipIds: string[];
  selectedTrackId?: string;
}
```

## 8. 从现有剪辑板映射

| 旧字段（chat-main） | 新字段 |
| --- | --- |
| `VideoClip.startTime` | `timelineStart` |
| `VideoClip.duration` | `duration` |
| `VideoClip.sourceStart` | `sourceIn` |
| `VideoClip.videoUrl` | `assets[assetId].src` |
| `VideoClip.title` | `assets[assetId].name` 或 clip 显示名冗余 |
| `TimelineSnapshot.videoClips` | `tracks[type=video].clips` |
| `TimelineSnapshot.audioClips` | `tracks[type=audio].clips` |

迁移函数应放在 `editor-schema`：`migrateFromChatTimeline(snapshot) -> Project`。

## 9. 时长推算

```ts
function projectDuration(project: Project): number {
  let max = 0;
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      max = Math.max(max, clip.timelineStart + clip.duration);
    }
  }
  return Math.max(max, 1 / project.settings.fps);
}
```

## 10. Schema 版本策略

- `schemaVersion` 每次破坏性变更 +1
- 打开工程时：`while (doc.schemaVersion < CURRENT) doc = migrate[doc.schemaVersion](doc)`
- 迁移必须纯函数、可单测

## 11. 示例（精简）

```json
{
  "schemaVersion": 1,
  "id": "prj_001",
  "name": "Demo",
  "createdAt": "2026-07-15T00:00:00.000Z",
  "updatedAt": "2026-07-15T00:00:00.000Z",
  "settings": { "width": 1080, "height": 1920, "fps": 30, "backgroundColor": "#000000" },
  "assets": {
    "asset_v1": {
      "id": "asset_v1",
      "type": "video",
      "name": "scene-01.mp4",
      "src": "https://cdn.example.com/scene-01.mp4",
      "duration": 8.4,
      "width": 1080,
      "height": 1920
    }
  },
  "tracks": [
    {
      "id": "trk_v1",
      "type": "video",
      "name": "Video",
      "clips": [
        {
          "id": "clip_1",
          "kind": "video",
          "trackId": "trk_v1",
          "assetId": "asset_v1",
          "timelineStart": 0,
          "duration": 4,
          "sourceIn": 1.2,
          "sourceOut": 5.2,
          "volume": 1,
          "transform": { "x": 0, "y": 0, "scaleX": 1, "scaleY": 1, "rotation": 0 }
        }
      ]
    },
    { "id": "trk_a1", "type": "audio", "name": "Audio", "clips": [] },
    { "id": "trk_t1", "type": "text", "name": "Text", "clips": [] }
  ]
}
```
