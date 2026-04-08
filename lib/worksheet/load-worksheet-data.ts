import 'server-only';

import { db } from '@/lib/db/drizzle';
import {
  lessons,
  courses,
  topics,
  quizzes,
  quiz_questions,
  cultural_content,
} from '@/lib/db/schema';
import { eq, inArray, or, asc } from 'drizzle-orm';
import { htmlToPlainText } from './plain-text';
import { languageLabelEn, levelLabelEn } from './labels';
import type { WorksheetData, WorksheetQuiz } from './types';
import {
  parseGapFillFromQuizDescription,
  formatGapPassageForPdf,
  passageHasGaps,
} from './gap-fill-passage';

function normalizeOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((o) => String(o).trim()).filter(Boolean);
  }
  if (raw && typeof raw === 'object') {
    return Object.values(raw as Record<string, unknown>)
      .map((o) => String(o).trim())
      .filter(Boolean);
  }
  return [];
}

export async function loadWorksheetData(lessonId: number): Promise<WorksheetData | null> {
  const [row] = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      content: lessons.content,
      cultural_information: lessons.cultural_information,
      course_title: courses.title,
      course_language: courses.language,
      course_level: courses.level,
    })
    .from(lessons)
    .leftJoin(courses, eq(lessons.course_id, courses.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!row) return null;

  const storyRows = await db
    .select({
      title: topics.title,
      content: topics.content,
      topic_type: topics.topic_type,
      topic_order: topics.topic_order,
    })
    .from(topics)
    .where(eq(topics.lesson_id, lessonId))
    .orderBy(asc(topics.topic_order));

  const storyBlocks = storyRows
    .filter((t) => t.topic_type === 'story_page')
    .map((t) => ({
      title: t.title,
      body: htmlToPlainText(t.content),
    }))
    .filter((b) => b.body || b.title);

  const storySections: WorksheetData['storySections'] = [];

  const mainText = htmlToPlainText(row.content);
  if (mainText) {
    storySections.push({
      heading: 'Lesson text',
      blocks: [{ title: '', body: mainText }],
    });
  }

  if (storyBlocks.length > 0) {
    storySections.push({
      heading: 'Stories / texts',
      blocks: storyBlocks.map((b) => ({
        title: b.title,
        body: b.body,
      })),
    });
  }

  const culturalRows = await db
    .select({
      title: cultural_content.title,
      description: cultural_content.description,
      content: cultural_content.content,
    })
    .from(cultural_content)
    .where(eq(cultural_content.lesson_id, lessonId))
    .orderBy(asc(cultural_content.id));

  const culturalBlocks: WorksheetData['culturalBlocks'] = [];

  const cultLesson = htmlToPlainText(row.cultural_information);
  if (cultLesson) {
    culturalBlocks.push({
      heading: 'Cultural context (lesson)',
      body: cultLesson,
    });
  }

  for (const c of culturalRows) {
    const parts = [c.description, c.content].map((p) => htmlToPlainText(p)).filter(Boolean);
    if (parts.length === 0) continue;
    culturalBlocks.push({
      heading: c.title,
      body: parts.join('\n\n'),
    });
  }

  const lessonTopicIds = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.lesson_id, lessonId));

  const topicIds = lessonTopicIds.map((t) => t.id);

  const quizRows = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      quiz_type: quizzes.quiz_type,
      description: quizzes.description,
    })
    .from(quizzes)
    .where(
      topicIds.length > 0
        ? or(eq(quizzes.lesson_id, lessonId), inArray(quizzes.topic_id, topicIds))
        : eq(quizzes.lesson_id, lessonId)
    )
    .orderBy(asc(quizzes.created_at));

  const worksheetQuizzes: WorksheetData['quizzes'] = [];

  for (const q of quizRows) {
    const qRows = await db
      .select({
        question_text: quiz_questions.question_text,
        question_type: quiz_questions.question_type,
        answer_options: quiz_questions.answer_options,
      })
      .from(quiz_questions)
      .where(eq(quiz_questions.quiz_id, q.id))
      .orderBy(asc(quiz_questions.question_order));

    const questions = qRows.map((qr) => ({
      questionText: htmlToPlainText(qr.question_text),
      questionType: qr.question_type,
      options: normalizeOptions(qr.answer_options),
    }));

    let gapFill: WorksheetQuiz['gapFill'] = null;
    let questionsOut = questions;

    if (q.quiz_type === 'gap_fill') {
      const fromDesc = parseGapFillFromQuizDescription(q.description);
      let rawPassage =
        (fromDesc?.rawPassage && fromDesc.rawPassage.trim()) ||
        (qRows[0] ? htmlToPlainText(qRows[0].question_text) : '');
      let words = fromDesc?.wordBank?.length ? [...fromDesc.wordBank] : [];
      if (words.length === 0 && qRows[0]) {
        words = normalizeOptions(qRows[0].answer_options);
      }
      if (rawPassage && passageHasGaps(rawPassage)) {
        gapFill = {
          passage: formatGapPassageForPdf(rawPassage),
          words,
        };
        questionsOut = [];
      }
    }

    worksheetQuizzes.push({
      title: q.title,
      quizType: q.quiz_type,
      gapFill,
      questions: questionsOut,
    });
  }

  return {
    lessonTitle: row.title,
    courseTitle: row.course_title ?? '—',
    languageLabel: languageLabelEn(row.course_language ?? undefined),
    levelLabel: levelLabelEn(row.course_level ?? undefined),
    storySections,
    culturalBlocks,
    quizzes: worksheetQuizzes,
  };
}
