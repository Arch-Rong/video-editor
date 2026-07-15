/**
 * @file vitest.config.ts
 * @description editor-core 单测配置：在 Node 环境跑纯函数测试（无需 jsdom）。
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
