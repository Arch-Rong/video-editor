import { describe, expect, it } from 'vitest';
import { createEmptyProject, type Project, type VideoClip } from '@ve/editor-schema';
import { getProjectDuration, splitVideoClip } from './index';

function withVideoClip(project: Project, clip: VideoClip): Project {
  return {
    ...project,
    tracks: project.tracks.map((track) =>
      track.type === 'video' ? { ...track, clips: [clip] } : track,
    ),
  };
}

describe('getProjectDuration', () => {
  it('returns at least one frame when empty', () => {
    const project = createEmptyProject({ fps: 30 });
    expect(getProjectDuration(project)).toBeCloseTo(1 / 30);
  });

  it('uses the last clip end', () => {
    const project = createEmptyProject();
    const trackId = project.tracks.find((t) => t.type === 'video')!.id;
    const next = withVideoClip(project, {
      id: 'c1',
      kind: 'video',
      trackId,
      assetId: 'a1',
      timelineStart: 2,
      duration: 4,
      sourceIn: 0,
      sourceOut: 4,
    });
    expect(getProjectDuration(next)).toBe(6);
  });
});

describe('splitVideoClip', () => {
  it('splits into two clips with updated source range', () => {
    const project = createEmptyProject();
    const trackId = project.tracks.find((t) => t.type === 'video')!.id;
    const base = withVideoClip(project, {
      id: 'c1',
      kind: 'video',
      trackId,
      assetId: 'a1',
      timelineStart: 0,
      duration: 4,
      sourceIn: 1,
      sourceOut: 5,
    });

    const split = splitVideoClip(base, 'c1', 2);
    const clips = split.tracks.find((t) => t.type === 'video')!.clips;
    expect(clips).toHaveLength(2);
    expect(clips[0]).toMatchObject({
      id: 'c1',
      duration: 2,
      sourceIn: 1,
      sourceOut: 3,
    });
    expect(clips[1]).toMatchObject({
      timelineStart: 2,
      duration: 2,
      sourceIn: 3,
      sourceOut: 5,
    });
  });
});
