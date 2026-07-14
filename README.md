# Video Editor

类剪映 Web 视频剪辑器（自研壳 + 零件）。MVP 技术栈：pnpm · Vite 6 · React 19 · Zustand · Zod · Tailwind 4。

## 仓库结构

```text
video-editor/
├── apps/web                 # 独立 Demo（开发入口）
├── packages/
│   ├── editor-schema        # Project JSON + zod（无 React）
│   ├── editor-core          # 剪辑纯逻辑 / 历史栈（无 React）
│   ├── editor-ui            # 时间轴 / 预览 / 面板
│   └── editor-embed         # 宿主用 <VideoEditor />
└── docs/                    # 产品与技术文档
```

## 命令

```bash
pnpm install
pnpm dev          # http://localhost:5177
pnpm test         # editor-core unit tests
pnpm typecheck
pnpm build
```

## Embed（给 Muse 等宿主）

```tsx
import { VideoEditor, createEmptyProject } from '@ve/editor-embed';

<VideoEditor
  initialProject={createEmptyProject({ name: 'From Muse' })}
  onChange={(project) => {
    // persist project JSON
  }}
/>
```

## 文档

见 [docs/README.md](./docs/README.md)。建项目锁定栈见 [docs/08-tech-stack.md](./docs/08-tech-stack.md)。
