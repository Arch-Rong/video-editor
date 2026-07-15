/**
 * @file cn.ts
 * @description 合并 Tailwind class 的小工具，避免条件 class 互相冲突。
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并多个 class 字符串 / 条件对象。
 * - clsx：处理条件拼接（如 `cn('a', isOn && 'b')`）
 * - twMerge：同一属性冲突时保留后者（如 `p-2` 覆盖 `p-4`）
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
