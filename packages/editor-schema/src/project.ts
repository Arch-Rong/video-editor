import { z } from 'zod';

/**
 * 当前工程 JSON 的 schema 版本号。
 * 以后字段不兼容时递增，并配合 migrate 函数升级旧工程。
 */
export const CURRENT_SCHEMA_VERSION = 1 as const;

/**
 * 画面上的 2D 变换（位置 / 缩放 / 旋转）。
 * 用于视频片段、字幕、贴图叠在预览画布上时的摆放。
 */
export const Transform2DSchema = z.object({
  /** 水平位移（实现约定原点后写死：画布中心或左上角） */
  x: z.number(),
  /** 垂直位移 */
  y: z.number(),
  /** 水平缩放，1 = 原始大小 */
  scaleX: z.number(),
  /** 垂直缩放，1 = 原始大小 */
  scaleY: z.number(),
  /** 旋转角度（度） */
  rotation: z.number(),
});

/**
 * 字幕 / 标题的文字样式。
 */
export const TextStyleSchema = z.object({
  /** 字体族，如 "PingFang SC" / "Inter" */
  fontFamily: z.string(),
  /** 字号（像素） */
  fontSize: z.number(),
  /** 文字颜色，如 "#ffffff" */
  color: z.string(),
  /** 对齐方式 */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** 字重，如 400 / 700 或 "bold" */
  fontWeight: z.union([z.number(), z.string()]).optional(),
  /** 行高 */
  lineHeight: z.number().optional(),
});

/**
 * 素材库里的「原始资源」。
 * Clip 只引用 assetId，不内嵌文件本身；大文件在对象存储，这里只存元数据 + URL。
 */
export const AssetSchema = z.object({
  /** 素材唯一 id */
  id: z.string(),
  /**
   * 素材类型：
   * - video / image / audio：主媒体
   * - font：字体
   * - lut：调色查找表
   * - sticker：贴纸图
   */
  type: z.enum(['video', 'image', 'audio', 'font', 'lut', 'sticker']),
  /** 显示名（素材库列表里看到的名字） */
  name: z.string(),
  /** 可播放 / 可下载的源地址（完整分辨率） */
  src: z.string(),
  /** 预览用低清代理地址，可选；scrub 时可优先用它 */
  proxySrc: z.string().optional(),
  /** 媒体时长（秒）；图片通常没有 */
  duration: z.number().optional(),
  /** 像素宽 */
  width: z.number().optional(),
  /** 像素高 */
  height: z.number().optional(),
  /** MIME，如 "video/mp4" */
  mimeType: z.string().optional(),
  /** 缩略图 URL，素材卡片封面 */
  thumbnail: z.string().optional(),
});

/**
 * 视频轨上的「软切」片段。
 *
 * 核心概念（和剪映一致）：
 * - timelineStart + duration：在时间轴上占哪一段（给你看、给你拖的位置）
 * - sourceIn + sourceOut：从源视频里取哪一段（裁剪不改源文件）
 * - 变速时：展示时长 ≈ (sourceOut - sourceIn) / speed
 */
export const VideoClipSchema = z.object({
  /** 片段 id（选中、分割、删除都靠它） */
  id: z.string(),
  /** 判别字段：固定为 video，方便和音频/文字等联合类型区分 */
  kind: z.literal('video'),
  /** 所属轨道 id */
  trackId: z.string(),
  /** 引用的素材 id → project.assets[assetId] */
  assetId: z.string(),
  /** 时间轴起始时间（秒），从工程 0 起算 */
  timelineStart: z.number(),
  /** 在时间轴上占用的时长（秒） */
  duration: z.number(),
  /** 源素材入点（秒）：从源视频的第几秒开始播 */
  sourceIn: z.number(),
  /** 源素材出点（秒）：播到源视频的第几秒结束；通常 = sourceIn + duration * speed */
  sourceOut: z.number(),
  /** 播放速度，默认 1；2 = 两倍速 */
  speed: z.number().optional(),
  /** 音量 0–1 */
  volume: z.number().optional(),
  /** 是否静音 */
  muted: z.boolean().optional(),
  /** 不透明度 0–1 */
  opacity: z.number().optional(),
  /** 画布变换（缩放、位移、旋转） */
  transform: Transform2DSchema.optional(),
});

/**
 * 音频轨片段（BGM / 旁白 / 音效）。
 * 时间含义与 VideoClip 相同：timeline 位置 + source 软切范围。
 */
export const AudioClipSchema = z.object({
  id: z.string(),
  kind: z.literal('audio'),
  trackId: z.string(),
  assetId: z.string(),
  /** 时间轴起始（秒） */
  timelineStart: z.number(),
  /** 时间轴占用时长（秒） */
  duration: z.number(),
  /** 源音频入点（秒） */
  sourceIn: z.number(),
  /** 源音频出点（秒） */
  sourceOut: z.number(),
  /** 音量 0–1 */
  volume: z.number().optional(),
  /** 淡入时长（秒） */
  fadeIn: z.number().optional(),
  /** 淡出时长（秒） */
  fadeOut: z.number().optional(),
});

/**
 * 字幕 / 标题片段。
 * 不依赖 Asset（文字内容直接存在 clip 上）；需要字体文件时可再在 assets 里挂 font。
 */
export const TextClipSchema = z.object({
  id: z.string(),
  kind: z.literal('text'),
  trackId: z.string(),
  timelineStart: z.number(),
  duration: z.number(),
  /** 字幕文案 */
  text: z.string(),
  /** 字体样式 */
  style: TextStyleSchema,
  /** 在画布上的位置 / 缩放 */
  transform: Transform2DSchema.optional(),
});

/**
 * 贴图层片段（贴纸、叠加图片等），引用 image/sticker 类 Asset。
 */
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

/**
 * 所有片段的联合类型。
 * 用 `kind` 做判别：读到 clip 后可根据 kind 收窄到具体类型。
 */
export const ClipSchema = z.discriminatedUnion('kind', [
  VideoClipSchema,
  AudioClipSchema,
  TextClipSchema,
  OverlayClipSchema,
]);

/**
 * 时间轴上的一条轨道。
 * 同一轨道里的 clips 按时间排布；多轨可叠画（例如两路视频）。
 */
export const TrackSchema = z.object({
  id: z.string(),
  /**
   * 轨道类型（决定轨道能放什么、UI 怎么画）：
   * - video：画面
   * - audio：声音
   * - text：字幕
   * - overlay：贴纸叠层
   * - effect：区间特效（预留）
   */
  type: z.enum(['video', 'audio', 'text', 'overlay', 'effect']),
  /** 轨道显示名，如 "Video" / "Audio" */
  name: z.string(),
  /** 锁定后不可编辑 */
  locked: z.boolean().optional(),
  /** 静音本轨（主要对面音频 / 带音视频） */
  muted: z.boolean().optional(),
  /** 隐藏本轨（预览 / 导出时不渲染画面） */
  hidden: z.boolean().optional(),
  /** 本轨上的全部片段 */
  clips: z.array(ClipSchema),
});

/**
 * 成片画布参数（预览框尺寸、导出分辨率、帧率）。
 */
export const ProjectSettingsSchema = z.object({
  /** 画布宽（像素），竖屏常用 1080 */
  width: z.number().int().positive(),
  /** 画布高（像素），竖屏常用 1920 */
  height: z.number().int().positive(),
  /** 帧率，如 30 */
  fps: z.number().positive(),
  /** 无画面时的底色，如 "#000000" */
  backgroundColor: z.string().optional(),
});

/**
 * 一份完整的剪辑工程（可保存 / 可嵌入宿主 / 可进入撤销栈）。
 *
 * 结构关系：
 * Project
 * ├─ settings          画布与帧率
 * ├─ assets            素材字典（id → Asset）
 * └─ tracks[]          多条轨道
 *     └─ clips[]       每条轨上的片段（引用 assetId）
 */
export const ProjectSchema = z.object({
  /** schema 版本，打开旧工程时用来判断要不要 migrate */
  schemaVersion: z.number().int().positive(),
  /** 工程 id */
  id: z.string(),
  /** 工程显示名（顶栏可改） */
  name: z.string(),
  /** 创建时间 ISO 字符串 */
  createdAt: z.string(),
  /** 最近修改时间 ISO 字符串 */
  updatedAt: z.string(),
  /** 画布设置 */
  settings: ProjectSettingsSchema,
  /**
   * 素材表：key 是 assetId。
   * Clip 只存 assetId，真正的 url / 时长在这里查。
   */
  assets: z.record(z.string(), AssetSchema),
  /** 轨道列表（从上到下的叠放顺序可在后续约定） */
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

/** 校验并解析未知 JSON 为 Project；不合法会抛 ZodError。 */
export function parseProject(input: unknown): Project {
  return ProjectSchema.parse(input);
}

/**
 * 创建一个空白工程。
 * 默认：竖屏 1080×1920、30fps、三条空轨（Video / Audio / Text）。
 */
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
