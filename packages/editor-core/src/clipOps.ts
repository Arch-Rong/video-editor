import type { Project, VideoClip } from '@ve/editor-schema';
import { touchProject } from './duration';

const MIN_CLIP_DURATION = 0.2;

function createId(): string {
  return crypto.randomUUID();
}

/**
 * Split a video clip at an absolute timeline time.
 * Returns the same project if the cut is too close to either edge.
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

    const local = atTimelineTime - clip.timelineStart;
    if (local < MIN_CLIP_DURATION || local > clip.duration - MIN_CLIP_DURATION) {
      return track;
    }

    const left: VideoClip = {
      ...clip,
      duration: local,
      sourceOut: clip.sourceIn + local * (clip.speed ?? 1),
    };

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

export function deleteClip(project: Project, clipId: string): Project {
  const tracks = project.tracks.map((track) => ({
    ...track,
    clips: track.clips.filter((c) => c.id !== clipId),
  }));
  return touchProject({ ...project, tracks });
}

export function renameProject(project: Project, name: string): Project {
  return touchProject({ ...project, name: name.trim() || project.name });
}
