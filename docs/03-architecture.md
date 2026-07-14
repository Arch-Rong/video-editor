# 技术架构

## 1. 设计原则

1. **UI 与引擎分离**：React 只负责呈现与手势；剪辑真相在 Engine / Store
2. **时间以秒为逻辑单位，渲染以帧换算**：`frame = round(time * fps)`
3. **软切优先**：裁剪默认不改源文件，只改 `sourceIn/sourceOut`
4. **预览与导出可分路径**：预览追求低延迟；导出追求保真
5. **可嵌入**：核心包可被 Lumina-Muse 或其他宿主引用

## 2. 仓库建议结构

```
video-editor/
├── apps/
│   └── web/                 # 独立 Web 应用壳（路由、登录、项目列表）
├── packages/
│   ├── editor-core/         # 纯逻辑：时间轴算法、历史、校验、选择模型
│   ├── editor-schema/       # Project JSON schema + zod 校验 + 迁移
│   ├── editor-ui/           # Timeline / Preview / Inspector / MediaLibrary
│   ├── editor-preview/      # 预览合成（Canvas / WebGL / video element 调度）
│   ├── editor-export/       # 导出适配（浏览器合成 / 调用渲染服务）
│   └── editor-embed/        # 对外 Embed 组件入口
├── services/
│   └── renderer/            # （可选）Node/FFmpeg 或 GPU 渲染服务
└── docs/
```

初期也可单体 `src/` 起步，但 **core / schema / ui** 边界从第一天就要划清，避免再次耦合进业务宿主。

## 3. 运行时分层

```
┌──────────────────────────────────────────────┐
│ Presentation（React UI）                     │
│  MediaLibrary | Preview | Timeline | Inspector│
└─────────────────┬────────────────────────────┘
                  │ commands / selectors
┌─────────────────▼────────────────────────────┐
│ Application Store（Zustand / RTK）           │
│  project · selection · playback · ui · history│
└─────────────────┬────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────┐
│ editor-core                                  │
│  clip ops · track ops · snap · normalize     │
│  history snapshots · invariants              │
└─────────────┬────────────────┬───────────────┘
              │                │
┌─────────────▼──────┐  ┌──────▼───────────────┐
│ Preview Runtime    │  │ Export Pipeline      │
│ clock · compositor │  │ job queue · FFmpeg   │
└────────────────────┘  └──────────────────────┘
```

## 4. 核心子系统

### 4.1 Project Store

真相源：`Project` 文档（见数据模型）。所有编辑通过 **Command** 产生新快照：

```
dispatch(splitClip(clipId, atTime))
  → core.reduce(project, command)
  → pushHistory(prev)
  → setProject(next)
```

禁止 UI 直接 mutate clip 数组字段。

### 4.2 Playback Clock

- `currentTime`、`isPlaying`、`isScrubbing`
- `requestAnimationFrame` 驱动播放；scrub 走指针事件
- 输出 `activeClipsAt(time)` 供预览合成

与现有 `timelinePlaybackStore` 概念对齐，但应上升为引擎级 clock，而不是 UI 组件私有状态。

### 4.3 Preview Compositor

推荐路径（分阶段）：

| 阶段 | 方案 | 适用 |
| --- | --- | --- |
| MVP | 主视频轨用 `<video>` 切换 + 字幕 DOM/Canvas 叠加 | 快验证 |
| v1 | OffscreenCanvas / WebGL 图层合成 | 多轨叠画、滤镜 |
| v2 | WebCodecs 细粒度帧控制 | 精确定帧、复杂特效 |

预览策略：

- 非活跃 clip 不解码
- filmstrip 与播放解码分流（队列限流，拖拽期间暂停抽帧）
- 跨域素材需可 CORS，否则走代理或降级绘制

### 4.4 Timeline Interaction

手势与渲染分离：

- **拖拽热路径**：直接操作 DOM transform / 幽灵层，不每帧 React render（沿用 `useClipReorder` 思路）
- **松手提交**：一次性 dispatch command
- 时间换算：`time = (contentX) / pixelsPerSecond`

关键常量建议保留可配置：

- `BASE_PPS = 80`（100% 缩放）
- `MIN_CLIP_DURATION = 0.2`
- `SCROLL_PADDING_SECONDS = 30`

### 4.5 Export Pipeline

```
ProjectJSON
  → resolve assets (本地/COS URL)
  → flatten timeline to render plan
  → browser compose OR POST /render
  → poll job
  → download / write asset library
```

Render Plan 示例概念：

```json
{
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "duration": 42.5,
  "layers": [
    { "type": "video", "assetId": "a1", "timelineStart": 0, "sourceIn": 1.2, "sourceOut": 5.0 },
    { "type": "text", "text": "Hello", "timelineStart": 1, "duration": 2 }
  ]
}
```

## 5. 媒体与存储

| 类型 | 建议 |
| --- | --- |
| 工程 JSON | IndexedDB（本地）+ 可选云端 API |
| 原始素材 | 对象存储（COS/S3）；编辑器持 assetId + url |
| 代理媒体 | 低分辨预览文件，加速 scrub |
| 导出产物 | 对象存储 + CDN |

## 6. 与 Lumina-Muse 集成方式

```
@lumina/chat-main（或 ctrl/canvas）
        │
        ▼ embed
@video-editor/editor-embed
        │
        ├── 读故事板 / 资产库 assets
        └── 回写导出视频 asset / 更新工程
```

迁移建议：

1. 先把 `EditPanel` 的 core 算法搬到 `editor-core`
2. UI 用新包重写或渐进替换
3. chat-main 只保留 Tab 入口与数据桥接

## 7. 性能预算（指导）

| 场景 | 目标 |
| --- | --- |
| 时间轴缩放 / 滚动 | 60fps UI |
| 片段拖拽重排 | 不触发整树重渲；松手一次提交 |
| 1080p 预览播放 | 可接受偶发掉帧；scrub 优先跟手 |
| Filmstrip | 串行队列；可见窗口优先 |

## 8. 质量保障

- **单元测试**：core 的 split / trim / reorder / snap / normalize
- **契约测试**：schema 版本迁移
- **E2E**：导入 → 分割 → 加字幕 → 导出（可用 fixtures）
- **视觉回归**（可选）：预览关键帧截图对比

## 9. 安全与合规

- 导出与上传走鉴权；不可把长期密钥放前端
- 跨域媒体只加载允许域名
- 用户素材隔离（按 userId / workspace）
