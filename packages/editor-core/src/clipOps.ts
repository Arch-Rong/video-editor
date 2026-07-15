/**
 * @file clipOps.ts
 * @description 针对 Project 的「编辑命令」纯函数。
 * UI / store 只应调用这些函数拿新 Project，不要直接 mutate tracks。
 */
import type { Project, VideoClip } from '@ve/editor-schema';
import { touchProject } from './duration';

/** 分割后左右两段各自至少这么长（秒），太短则拒绝切割 */
const MIN_CLIP_DURATION = 0.2;

/** 生成新片段 id */
function createId(): string {
  return crypto.randomUUID();
}

/**
 * 在绝对时间轴时刻切开一个视频片段（软切）。
 *
 * @param project 当前工程
 * @param clipId 要切的视频片段 id
 * @param atTimelineTime 切割点（工程时间轴上的秒数，不是源视频内偏移）
 * @returns 新的工程；若切点太靠近边缘 / 不是视频 / 找不到片段，则返回未改动的工程
 *
 * 行为说明：
 * - 左半段保留原 id，缩短 duration，并收紧 sourceOut
 * - 右半段生成新 id，timelineStart 接在切割点，sourceIn 接上左半段的 sourceOut
 */
export function splitVideoClip(
  project: Project,
  clipId: string,
  atTimelineTime: number,
): Project {
  const tracks = project.tracks.map((track) => {
    const index = track.clips.findIndex((c) => c.id === clipId);
    if (index < 0) return track;

    const clip = track.clips[index];
    if (clip.kind !== 'video') return track;

    // 切割点相对该片段起点的本地时间
    const local = atTimelineTime - clip.timelineStart;
    if (local < MIN_CLIP_DURATION || local > clip.duration - MIN_CLIP_DURATION) {
      return track;
    }

    // 左半段：保留原 id，截到切割点
    const left: VideoClip = {
      ...clip,
      duration: local,
      sourceOut: clip.sourceIn + local * (clip.speed ?? 1),
    };

    // 右半段：新 id，从切割点接到原结束
    const right: VideoClip = {
      ...clip,
      id: createId(),
      timelineStart: clip.timelineStart + local,
      duration: clip.duration - local,
      sourceIn: left.sourceOut,
      sourceOut: clip.sourceOut,
    };

    const clips = [...track.clips];
    clips.splice(index, 1, left, right);
    return { ...track, clips };
  });

  return touchProject({ ...project, tracks });
}

/**
 * 按 id 删除任意类型的片段（视频 / 音频 / 字幕 / 贴图）。
 * 找不到该 id 时相当于空操作（仍会 touch updatedAt）。
 */
export function deleteClip(project: Project, clipId: string): Project {
  const tracks = project.tracks.map((track) => ({
    ...track,
    clips: track.clips.filter((c) => c.id !== clipId),
  }));
  return touchProject({ ...project, tracks });
}

/**
 * 重命名工程。
 * 传入空字符串 / 纯空格时保持原名不变。
 */
export function renameProject(project: Project, name: string): Project {
  return touchProject({ ...project, name: name.trim() || project.name });
}
