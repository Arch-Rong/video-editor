import type { Project } from '@ve/editor-schema';

/** Timeline duration in seconds from the last clip end. */
export function getProjectDuration(project: Project): number {
  let max = 0;
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      max = Math.max(max, clip.timelineStart + clip.duration);
    }
  }
  return Math.max(max, 1 / project.settings.fps);
}

export function touchProject(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}
