const LEVEL_DE: Record<string, string> = {
  beginner: 'Anfänger',
  intermediate: 'Mittelstufe',
  advanced: 'Fortgeschritten',
};

const LANG_DE: Record<string, string> = {
  french: 'Französisch',
  german: 'Deutsch',
  spanish: 'Spanisch',
  all: 'Alle Sprachen',
};

export function levelLabelDe(code: string | null | undefined): string {
  if (!code) return '—';
  return LEVEL_DE[code] ?? code;
}

export function languageLabelDe(code: string | null | undefined): string {
  if (!code) return '—';
  return LANG_DE[code] ?? code;
}

const LEVEL_EN: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const LANG_EN: Record<string, string> = {
  french: 'French',
  german: 'German',
  spanish: 'Spanish',
  all: 'All languages',
};

export function levelLabelEn(code: string | null | undefined): string {
  if (!code) return '—';
  return LEVEL_EN[code] ?? code;
}

export function languageLabelEn(code: string | null | undefined): string {
  if (!code) return '—';
  return LANG_EN[code] ?? code;
}
