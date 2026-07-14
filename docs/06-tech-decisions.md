# 技术选型与关键决策

决策记录风格：说明「选什么 / 为什么 / 不选什么」。若后续推翻，请在本文件追加 ADR 条目。

---

## ADR-001：总体技术栈

**决策**：Web 端 TypeScript + React；包管理 pnpm；构建 Vite。

**理由**：

- 与 Lumina-Muse / web-app 技术栈一致，便于嵌入与人员切换
- 生态成熟，适合复杂交互编辑器

**不选**：

- 纯 Canvas 自研 UI 框架：成本过高
- 首期 Electron：延后到本地编解码成为瓶颈时再上

---

## ADR-002：状态管理

**决策**：编辑器内核使用 Zustand（或等价轻量 store）+ 不可变 Project 快照；历史栈独立。

**理由**：

- 现有剪辑板已用 Zustand，迁移成本低
- 编辑器更新频繁，避免过重样板代码

**约束**：

- UI 不得直接 mutate `project.tracks`
- 所有编辑走 command/reducer

**备选**：Redux Toolkit（若需更强中间件与时间旅行调试可升）

---

## ADR-003：预览渲染

**决策**：

- MVP：主轨 `<video>` + 字幕 DOM/Canvas 叠加
- v1：引入 Canvas/WebGL compositor
- 评估期后考虑 WebCodecs

**理由**：先打通产品闭环；过早 WebGL/WebCodecs 会拖慢 MVP。

**风险**：预览与导出不一致 → 用同一套 Render Plan 描述时间线。

---

## ADR-004：导出链路

**决策**：双通道

1. **轻量导出**：片段 trim + concat（复用现有视频合并服务）
2. **完整导出**：服务端根据 Render Plan 用 FFmpeg（或后续自研）渲染

**理由**：浏览器端复杂多轨+滤镜+字幕稳定性差；服务端可控。

**不选**：首期完全依赖 Remotion 作为用户自由时间轴导出引擎（Remotion 更适合程序化成片；可作为模板/指定合成备选，不作为通用 NLE 后端唯一方案）。

---

## ADR-005：工程持久化

**决策**：

- 本地：IndexedDB 存 Project JSON + 素材元数据
- 云端：可选 REST（`GET/PUT /projects/:id`）
- 大文件永远走对象存储，JSON 只存 URL/assetId

---

## ADR-006：包边界

**决策**：至少拆分

- `editor-schema`：类型与校验
- `editor-core`：纯逻辑
- `editor-ui`：界面
- `editor-embed`：对外入口

**理由**：避免再次出现「剪辑逻辑深埋在业务包」难以复用的问题。

---

## ADR-007：时间单位

**决策**：逻辑层统一使用 **秒（number, float）**；渲染/导出边界再换算帧。

**理由**：与现有剪辑板一致；UI 拖拽更直观。

**注意**：比较时用 fps 容差或量化到帧，避免累计误差。

---

## ADR-008：样式方案

**决策**：独立产品可用 Tailwind 4 CSS-first；嵌入 Muse 时提供无障碍主题变量（CSS variables）。

**约束**：编辑器内部不依赖 Muse 业务 less；通过 token 适配宿主外观。

---

## ADR-009：测试策略

**决策**：

- core 算法必须单测（split/trim/reorder/snap）
- schema migrate 必须单测
- 关键路径 E2E 一条黄金流

不追求首期高视觉覆盖率。

---

## ADR-010：与剪映的能力边界

**决策**：产品对标剪映**主剪辑工作台**，不对标其全部生态（商城、直播、全平台账号同步）于 v1。

每期只从功能规格 P0/P1 拉取，防止范围失控。

---

## ADR-011：MVP 技术栈锁定

**决策**：见 [08-tech-stack.md](./08-tech-stack.md)。摘要：

- pnpm 9 + Vite 6 + React 19 + TS 5.9
- Zustand 5 + Zod + Tailwind 4 + Vitest
- 轻 monorepo：`apps/web` + `packages/{editor-schema,editor-core,editor-ui,editor-embed}`
- 预览：HTML media；导出：服务端 FFmpeg 适配器
- **不引入**任何完整 NLE SDK

**版本对齐**：优先与当前 Lumina-Muse（React 19.2 / Vite 6.4 / pnpm 9.15）同代，降低嵌入成本。

---

## 推荐依赖方向

以 `08-tech-stack.md` 为准；引入新库前确认：是否与现有仓库重复、是否影响 Embed 体积。
