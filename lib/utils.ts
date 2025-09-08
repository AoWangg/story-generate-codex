import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeDownloadFilename(
  raw: string,
  fallbackPrefix: string,
  ext: string
) {
  let name = (raw || '').toString();
  name = name.replace(/^[#\s*_>\-]+/, '').replace(/[\r\n]+/g, ' ');
  // Remove path separators and illegal characters (Windows/macOS safe)
  name = name.replace(/[\\/<>:"|?*]+/g, ' ');
  // Keep unicode letters/numbers/spaces/._-; drop others
  name = name.replace(/[^\p{L}\p{N}\s._-]+/gu, '');
  name = name.replace(/\s+/g, ' ').trim();
  // Convert spaces to hyphens
  name = name.replace(/\s/g, '-');
  // Trim leading/trailing dots and dashes
  name = name.replace(/^[.-]+|[.-]+$/g, '');

  if (!name) {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    name = `${fallbackPrefix}-${stamp}`;
  }

  const dot = ext.startsWith('.') ? '' : '.';
  return `${name}${dot}${ext}`;
}
