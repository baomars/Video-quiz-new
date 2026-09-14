import { staticFile } from 'remotion';

export function resolveMedia(src?: string): string {
  if (!src) return '';
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  // Strip leading slash for staticFile
  const cleanPath = src.startsWith('/') ? src.slice(1) : src;
  try {
    return staticFile(cleanPath);
  } catch {
    return src;
  }
}
