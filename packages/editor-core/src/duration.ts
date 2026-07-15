/**
 * @file duration.ts
 * @description 工程时长相关的纯函数（不碰 React / DOM）。
 */
import type { Project } from '@ve/editor-schema';

/**
 * 计算工程在时间轴上的总时长（秒）。
 *
 * 规则：取所有轨道里「片段结束时间」的最大值
 * （`timelineStart + duration`）。
 * 若工程完全为空，至少返回 1 帧时长 `1 / fps`，避免除零或 0 宽画布。
 */
export function getProjectDuration(project: Project): number {
  let max = 0;
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      max = Math.max(max, clip.timelineStart + clip.duration);
    }
  }
  return Math.max(max, 1 / project.settings.fps);
}

/**
 * 浅拷贝工程并刷新 `updatedAt`。
 * 任何会改工程内容的操作结束前都应调用，方便后续自动保存判断「是否脏」。
 */
export function touchProject(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}
