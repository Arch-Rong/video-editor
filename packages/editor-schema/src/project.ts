import { z } from 'zod';

export const CURRENT_SCHEMA_VERSION = 1 as const;

export const Transform2DSchema = z.object({
  x: z.number(),
  y: z.number(),
  scaleX: z.number(),
  scaleY: z.number(),
  rotation: z.number(),
});

export const TextStyleSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number(),
  color: z.string(),
  align: z.enum(['left', 'center', 'right']).optional(),
  fontWeight: z.union([z.number(), z.string()]).optional(),
  lineHeight: z.number().optional(),
});

export const AssetSchema = z.object({
  id: z.string(),
  type: z.enum(['video', 'image', 'audio', 'font', 'lut', 'sticker']),
  name: z.string(),
  src: z.string(),
  proxySrc: z.string().optional(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  mimeType: z.string().optional(),
  thumbnail: z.string().optional(),
});

export const VideoClipSchema = z.object({
  id: z.string(),
  kind: z.literal('video'),
  trackId: z.string(),
  assetId: z.string(),
  timelineStart: z.number(),
  duration: z.number(),
  sourceIn: z.number(),
  sourceOut: z.number(),
  speed: z.number().optional(),
  volume: z.number().optional(),
  muted: z.boolean().optional(),
  opacity: z.number().optional(),
  transform: Transform2DSchema.optional(),
});

export const AudioClipSchema = z.object({
  id: z.string(),
  kind: z.literal('audio'),
  trackId: z.string(),
  assetId: z.string(),
  timelineStart: z.number(),
  duration: z.number(),
  sourceIn: z.number(),
  sourceOut: z.number(),
  volume: z.number().optional(),
  fadeIn: z.number().optional(),
  fadeOut: z.number().optional(),
});

export const TextClipSchema = z.object({
  id: z.string(),
  kind: z.literal('text'),
  trackId: z.string(),
  timelineStart: z.number(),
  duration: z.number(),
  text: z.string(),
  style: TextStyleSchema,
  transform: Transform2DSchema.optional(),
});

export const OverlayClipSchema = z.object({
  id: z.string(),
  kind: z.literal('overlay'),
  trackId: z.string(),
  assetId: z.string(),
  timelineStart: z.number(),
  duration: z.number(),
  opacity: z.number().optional(),
  transform: Transform2DSchema.optional(),
});

export const ClipSchema = z.discriminatedUnion('kind', [
  VideoClipSchema,
  AudioClipSchema,
  TextClipSchema,
  OverlayClipSchema,
]);

export const TrackSchema = z.object({
  id: z.string(),
  type: z.enum(['video', 'audio', 'text', 'overlay', 'effect']),
  name: z.string(),
  locked: z.boolean().optional(),
  muted: z.boolean().optional(),
  hidden: z.boolean().optional(),
  clips: z.array(ClipSchema),
});

export const ProjectSettingsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().positive(),
  backgroundColor: z.string().optional(),
});

export const ProjectSchema = z.object({
  schemaVersion: z.number().int().positive(),
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: ProjectSettingsSchema,
  assets: z.record(z.string(), AssetSchema),
  tracks: z.array(TrackSchema),
});

export type Transform2D = z.infer<typeof Transform2DSchema>;
export type TextStyle = z.infer<typeof TextStyleSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type VideoClip = z.infer<typeof VideoClipSchema>;
export type AudioClip = z.infer<typeof AudioClipSchema>;
export type TextClip = z.infer<typeof TextClipSchema>;
export type OverlayClip = z.infer<typeof OverlayClipSchema>;
export type Clip = z.infer<typeof ClipSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;
export type Project = z.infer<typeof ProjectSchema>;

export function parseProject(input: unknown): Project {
  return ProjectSchema.parse(input);
}

export function createEmptyProject(options?: {
  name?: string;
  width?: number;
  height?: number;
  fps?: number;
}): Project {
  const now = new Date().toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name: options?.name ?? 'Untitled',
    createdAt: now,
    updatedAt: now,
    settings: {
      width: options?.width ?? 1080,
      height: options?.height ?? 1920,
      fps: options?.fps ?? 30,
      backgroundColor: '#000000',
    },
    assets: {},
    tracks: [
      { id: crypto.randomUUID(), type: 'video', name: 'Video', clips: [] },
      { id: crypto.randomUUID(), type: 'audio', name: 'Audio', clips: [] },
      { id: crypto.randomUUID(), type: 'text', name: 'Text', clips: [] },
    ],
  };
}
