import { htmlToPlainText } from './plain-text';

/** Normalise word bank from DB / quiz config (string, array, or object). */
export function parseWordBankField(wb: unknown): string[] {
  if (Array.isArray(wb)) {
    return wb.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof wb === 'string') {
    return wb
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (wb && typeof wb === 'object') {
    return Object.values(wb as Record<string, unknown>)
      .map((x) => String(x).trim())
      .filter(Boolean);
  }
  return [];
}

function pickNonEmptyString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c;
  }
  return '';
}

/**
 * Extract passage source + word bank from quiz.description JSON (config.gap_fill).
 */
export function parseGapFillFromQuizDescription(description: string | null | undefined): {
  rawPassage: string;
  wordBank: string[];
} | null {
  if (!description || typeof description !== 'string') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(description);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const config = (parsed as { config?: unknown }).config;
  if (!config || typeof config !== 'object') return null;
  const gf = (config as { gap_fill?: unknown }).gap_fill;
  if (!gf || typeof gf !== 'object') return null;

  const g = gf as Record<string, unknown>;
  const rawPassage = pickNonEmptyString(
    g.text_content,
    g.text_with_gaps,
    g.gf_text_content,
    g.original_text
  );

  let wordBank = parseWordBankField(g.word_bank);
  if (wordBank.length === 0) {
    wordBank = parseWordBankField(g.gf_word_bank);
  }

  if (!rawPassage && wordBank.length === 0) return null;
  return { rawPassage, wordBank };
}

/** Replace [BLANK] and {solutions} with printable underscores for worksheets. */
export function formatGapPassageForPdf(raw: string): string {
  let s = htmlToPlainText(raw);
  s = s.replace(/\{[^}]+\}/g, ' ______ ');
  s = s.replace(/\[BLANK\]/gi, ' ______ ');
  s = s.replace(/[ \t]+/g, ' ');
  return s.trim();
}

export function passageHasGaps(text: string): boolean {
  return /\[BLANK\]/i.test(text) || /\{[^}]+\}/.test(text);
}
