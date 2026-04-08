import 'server-only';

import fs from 'fs';
import path from 'path';

/** Files tried in order under `public/` (formats @react-pdf/renderer handles reliably). */
const CANDIDATES = ['logo.png', 'logo.jpg', 'logo.jpeg'] as const;

function readPublicImageDataUri(filename: string): string | null {
  const full = path.join(process.cwd(), 'public', filename);
  if (!fs.existsSync(full)) return null;
  const buf = fs.readFileSync(full);
  const ext = path.extname(filename).toLowerCase();
  const mime =
    ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

/**
 * Returns a data URI for the site logo for embedding in PDFs, or null if no file exists.
 */
export function getWorksheetLogoDataUri(): string | null {
  for (const name of CANDIDATES) {
    const uri = readPublicImageDataUri(name);
    if (uri) return uri;
  }
  return null;
}

/** Header icon at the top of worksheet PDFs (`public/worksheet.png`). */
export function getWorksheetHeaderIconDataUri(): string | null {
  return readPublicImageDataUri('worksheet.png');
}
