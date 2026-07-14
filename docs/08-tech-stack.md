# 技术栈选型（建项目用）

> **状态：已锁定（MVP）**  
> 原则：与 Lumina-Muse 对齐，便于嵌入；自研壳 + 零件，不引入整包剪辑 SDK。

你本地创建项目时，按本文选型即可。无需再纠结 Twick / DesignCombo 等。

---

## 1. 一句话栈

**pnpm + Vite 6 + React 19 + TypeScript 5.9 + Zustand 5 + Zod + Tailwind 4**

导出继续走 **服务端 FFmpeg**（接口层自己写适配）；时间轴 UI **首期自研/迁 Muse**，不够再加 `@xzdarcy/react-timeline-editor`。

---

## 2. 锁定清单

### 2.1 运行时与工程

| 层 | 选择 | 建议版本（与 Muse 对齐） | 说明 |
| --- | --- | --- | --- |
| 包管理 | **pnpm** | `9.15.x` | 写进 `packageManager` |
| 语言 | **TypeScript** | `~5.9` | `strict: true` |
| 构建 | **Vite** | `^6.4` | 与 Muse 同代 |
| 框架 | **React** | `^19.2` | 同 Muse |
| 路由（独立 App） | **react-router-dom** | `^7` | Embed 模式可不依赖路由 |
| 模块 | **ESM** | `"type": "module"` | |

### 2.2 编辑器核心

| 层 | 选择 | 说明 |
| --- | --- | --- |
| 状态 | **zustand** `^5` | 与剪辑板一致 |
| 校验 / Schema | **zod** | Project JSON、migrate |
| 不可变更新 | 手写纯函数即可；可选 **immer**（非必须） | 历史栈用快照拷贝 |
| id | `crypto.randomUUID()` 或现有 `createClientId` 思路 | 不要再引 uuid 除非必要 |
| 类名合并 | **clsx** + **tailwind-merge**（`cn`） | |

### 2.3 UI

| 层 | 选择 | 说明 |
| --- | --- | --- |
| 样式 | **Tailwind CSS v4** + `@tailwindcss/vite` | 独立产品壳；嵌入 Muse 时用 CSS 变量换肤 |
| 组件策略 | **自研编辑器专用组件为主** | 不要整站 Ant Design 绑死时间轴 |
| 图标 | **lucide-react** | Muse 已有；轻量 |
| 宿主嵌入 | 提供无依赖 antd 的 Embed 入口 | 宿主自己包一层布局 |

> 独立 Demo App 里用 antd 做项目列表可以，但 **`editor-ui` 包内避免强依赖 antd**，方便嵌 Muse。

### 2.4 媒体与导出（MVP）

| 层 | 选择 | 说明 |
| --- | --- | --- |
| 预览 | 原生 `<video>` / `<audio>` + 字幕 DOM/Canvas | 不做 WebGL |
| 本地工程 | **idb-keyval** 或原生 IndexedDB 小封装 | 存 Project JSON |
| 导出 | **自有/现有 FFmpeg HTTP API** | 适配器放 `editor-export` |
| 浏览器 ffmpeg | **不上** ffmpeg.wasm（MVP） | |

### 2.5 质量工具

| 层 | 选择 |
| --- | --- |
| 单测 | **Vitest** |
| E2E（可后补） | Playwright |
| Lint | ESLint 9 flat + typescript-eslint |
| Format | Prettier |
| Git hooks（可选） | husky + lint-staged |

---

## 3. 明确不选（建项目时别装）

| 不要 | 原因 |
| --- | --- |
| Twick / Elah / VideoFlow Editor / DesignCombo / Shotstack Studio | 整包 SDK，非主路径 |
| Remotion（MVP） | 不是 NLE；模板成片以后另开包再说 |
| Redux Toolkit（MVP） | Zustand 够用 |
| axios | `fetch` 即可 |
| Electron（MVP） | 纯 Web |
| MUI | 与 Muse(antd) 无关；编辑器也不绑 MUI |
| `@xzdarcy/react-timeline-editor`（第 0 天） | 先迁自有时间轴；不够再加 |

---

## 4. 推荐仓库形态

**起步用「轻 monorepo」**（pnpm workspace），方便以后被 Muse `workspace:` 或 npm 引用：

```text
video-editor/
├── package.json                 # private root
├── pnpm-workspace.yaml
├── apps/
│   └── web/                     # 独立 Demo：项目列表 + 打开编辑器
└── packages/
    ├── editor-schema/           # zod + types + migrate
    ├── editor-core/             # 纯逻辑（无 React）
    ├── editor-ui/               # Timeline / Preview / Inspector
    └── editor-embed/            # <VideoEditor /> 对外入口
```

若你更想先单仓快跑：可以先 `apps/web` 单体，但 **文件夹仍按 schema / core / ui 切开**，两周内再拆包。

`pnpm-workspace.yaml` 示例：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 5. 创建命令参考（你来执行）

在空仓库根目录：

```bash
# 1) 初始化
pnpm init
# packageManager 写死 pnpm@9.15.9（与 Muse 一致更省事）

# 2) 建 workspace 后，给 apps/web 脚手架（任选）
cd apps
pnpm create vite web --template react-ts
cd ..

# 3) 根与 app 常见依赖（版本按上文锁定）
pnpm add -w react react-dom zustand zod
pnpm add -w -D typescript vite @vitejs/plugin-react @types/react @types/react-dom vitest

# Tailwind 4（在 apps/web）
pnpm add -D tailwindcss @tailwindcss/vite --filter web
```

`apps/web/vite.config.ts` 要点：

- `@vitejs/plugin-react`
- `tailwindcss()`（`@tailwindcss/vite`）
- `resolve.alias`：`@editor/schema` → `packages/editor-schema` 等

`tsconfig` 路径别名与 Vite alias 保持一致。

---

## 6. 包职责边界（建目录时贴这张）

| 包 | 允许依赖 | 禁止 |
| --- | --- | --- |
| `editor-schema` | zod | react、dom |
| `editor-core` | schema | react、浏览器 API（尽量纯） |
| `editor-ui` | react、core、schema、tailwind | 业务宿主 API |
| `editor-embed` | ui + schema | Muse 内部包 |
| `apps/web` | embed | — |

---

## 7. 默认工程参数（写进 schema 默认值）

| 项 | MVP 默认 |
| --- | --- |
| 画布 | 1080 × 1920（9:16） |
| fps | 30 |
| 导出 | mp4 / H.264 |
| 时间单位 | 秒（number） |
| schemaVersion | `1` |

---

## 8. 和 Muse 对齐备忘

| Muse | video-editor |
| --- | --- |
| React 19 + Vite 6 + pnpm 9 | 相同 |
| zustand 剪辑板 | 相同 |
| antd 业务壳 | **编辑器内核不绑 antd** |
| less | **新项目用 Tailwind 4** |
| 导出 merge API | `editor-export` 适配，URL 可配置 |

嵌入时：Muse 只依赖 `@video-editor/embed`（包名你可定为 `@lumina/video-editor` 或 `@ve/embed`），传入 `assets` / `initialProject`。

---

## 9. 你建好后第一批目录 Checklist

- [ ] `packages/editor-schema/src/project.ts` + `zod` schema  
- [ ] `packages/editor-core/src/{split,trim,reorder,history}.ts` + Vitest  
- [ ] `apps/web` 能打开空白编辑器壳（顶栏 + 预览区 + 空时间轴）  
- [ ] README 写：`pnpm install` / `pnpm --filter web dev`  

---

## 10. 选定结果（可直接写进立项）

```
Stack: pnpm 9 · Vite 6 · React 19 · TS 5.9 · Zustand 5 · Zod · Tailwind 4 · Vitest
Shape: pnpm workspace（apps/web + packages/{schema,core,ui,embed}）
Preview: HTML video + DOM/Canvas overlay
Export: Server FFmpeg adapter
SDK: none（no full NLE SDK）
```
