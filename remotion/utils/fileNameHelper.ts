/**
 * Utility functions for generating and sanitizing video render filenames.
 * Rule: [Video Title]_[YYYY-MM-DD]_[Video Number].mp4
 * - Vietnamese diacritics stripped.
 * - English preserved.
 * - Invalid filename characters replaced with underscore.
 * - Padded video index (01, 02, 03...).
 */

/**
 * Strips Vietnamese diacritics and replaces non-alphanumeric characters with underscores.
 */
export function sanitizeTitleForFilename(title: string): string {
  if (!title || typeof title !== 'string') return 'Video_Quiz';

  // 1. Remove Vietnamese accents/diacritics using NFD normalization
  let str = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 2. Handle specific Vietnamese characters that NFD does not split
  str = str
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

  // 3. Replace invalid file system characters and symbols with underscores
  // Keep: a-z, A-Z, 0-9
  str = str.replace(/[^a-zA-Z0-9]/g, '_');

  // 4. Collapse multiple consecutive underscores
  str = str.replace(/_+/g, '_');

  // 5. Trim leading and trailing underscores
  str = str.replace(/^_+|_+$/g, '');

  return str || 'Video_Quiz';
}

/**
 * Cleans a user-provided file name to be safe for filesystem and OS, ensuring .mp4 extension.
 */
export function sanitizeCustomFileName(fileName: string, fallbackTitle: string = 'Video_Quiz'): string {
  if (!fileName || typeof fileName !== 'string' || !fileName.trim()) {
    return `${sanitizeTitleForFilename(fallbackTitle)}.mp4`;
  }

  let clean = fileName.trim();

  // Strip .mp4 at the end if present to sanitize the base
  if (clean.toLowerCase().endsWith('.mp4')) {
    clean = clean.slice(0, -4);
  }

  // Remove accents
  clean = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  clean = clean.replace(/đ/g, 'd').replace(/Đ/g, 'D');

  // Replace invalid filename characters (/ \ : * ? " < > |)
  clean = clean.replace(/[/\\:*?"<>|]/g, '_');

  // Replace spaces with underscores
  clean = clean.replace(/\s+/g, '_');

  // Collapse underscores
  clean = clean.replace(/_+/g, '_');
  clean = clean.replace(/^_+|_+$/g, '');

  if (!clean) clean = sanitizeTitleForFilename(fallbackTitle);

  return `${clean}.mp4`;
}

/**
 * Generates the standardized default filename:
 * [Video Title]_[YYYY-MM-DD]_[Video Number].mp4
 */
export function generateDefaultFileName(
  title: string,
  videoIndex: number = 1,
  dateInput?: Date
): string {
  const d = dateInput || new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const cleanTitle = sanitizeTitleForFilename(title);
  const numStr = String(Math.max(1, videoIndex)).padStart(2, '0');

  return `${cleanTitle}_${dateStr}_${numStr}.mp4`;
}
