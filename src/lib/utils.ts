import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with locale-specific separators */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Format a percentage with optional decimals */
export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

/** Generate a random number in a range */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Lerp between two values */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map a value from one range to another */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/** Color interpolation for heatmaps */
export function interpolateColor(value: number): string {
  // 0 = deep indigo, 0.5 = purple, 1.0 = hot magenta
  const r = Math.round(99 + value * (236 - 99));
  const g = Math.round(102 - value * (102 - 72));
  const b = Math.round(241 - value * (241 - 153));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Generate time ago string */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
