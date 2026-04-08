export interface WorksheetStoryBlock {
  title: string;
  body: string;
}

export interface WorksheetStorySection {
  heading: string;
  blocks: WorksheetStoryBlock[];
}

export interface WorksheetCulturalBlock {
  heading: string;
  body: string;
}

export interface WorksheetQuizQuestion {
  questionText: string;
  questionType: string;
  options: string[];
}

/** One printable gap-fill block (quiz-level, e.g. quiz_type gap_fill). */
export interface WorksheetGapFill {
  /** Text with gaps shown as ______ (no [BLANK] / no {answers}). */
  passage: string;
  words: string[];
}

export interface WorksheetQuiz {
  title: string;
  quizType?: string | null;
  /** When set, render this instead of individual questions (avoids duplicate [BLANK] lines). */
  gapFill?: WorksheetGapFill | null;
  questions: WorksheetQuizQuestion[];
}

export interface WorksheetData {
  lessonTitle: string;
  courseTitle: string;
  languageLabel: string;
  levelLabel: string;
  storySections: WorksheetStorySection[];
  culturalBlocks: WorksheetCulturalBlock[];
  quizzes: WorksheetQuiz[];
}
