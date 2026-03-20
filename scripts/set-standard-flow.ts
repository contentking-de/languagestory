import { db } from '../lib/db/drizzle';
import { lessons, quizzes, games, topics } from '../lib/db/content-schema';
import { eq } from 'drizzle-orm';

type FlowItem = {
  key: string;
  type: 'vocab' | 'content' | 'cultural' | 'quiz' | 'game' | 'grammar';
  id?: number;
  title?: string;
};

const STANDARD_ORDER: Record<string, number> = {
  'vocab': 1,
  'game:vocab_run': 2,
  'game:memory': 3,
  'content': 4,
  'quiz:multiple_choice': 5,
  'game:listen_type': 6,
  'quiz:gap_fill': 7,
  'grammar': 8,
  'game:word_search': 9,
  'game:hangman': 10,
  'cultural': 11,
  'quiz:true_false': 12,
};

function getSortKey(
  item: FlowItem,
  quizzesMap: Map<number, string>,
  gamesMap: Map<number, string>
): number {
  if (item.type === 'vocab') return STANDARD_ORDER['vocab'];
  if (item.type === 'content') return STANDARD_ORDER['content'];
  if (item.type === 'cultural') return STANDARD_ORDER['cultural'];
  if (item.type === 'grammar') return STANDARD_ORDER['grammar'];

  if (item.type === 'quiz' && item.id) {
    const quizType = quizzesMap.get(item.id);
    if (quizType) {
      const key = `quiz:${quizType}`;
      return STANDARD_ORDER[key] ?? 100;
    }
  }

  if (item.type === 'game' && item.id) {
    const gameType = gamesMap.get(item.id);
    if (gameType) {
      const key = `game:${gameType}`;
      return STANDARD_ORDER[key] ?? 100;
    }
  }

  return 100;
}

function flowsAreEqual(a: FlowItem[], b: FlowItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => item.key === b[i].key);
}

async function main() {
  console.log('Fetching all lessons...');

  const allLessons = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      content: lessons.content,
      cultural_information: lessons.cultural_information,
      flow_order: lessons.flow_order,
    })
    .from(lessons);

  console.log(`Found ${allLessons.length} lessons.\n`);

  let updated = 0;
  let skipped = 0;

  for (const lesson of allLessons) {
    const lessonQuizzes = await db
      .select({ id: quizzes.id, quiz_type: quizzes.quiz_type, title: quizzes.title })
      .from(quizzes)
      .where(eq(quizzes.lesson_id, lesson.id));

    const lessonGames = await db
      .select({ id: games.id, game_type: games.game_type, title: games.title })
      .from(games)
      .where(eq(games.lesson_id, lesson.id));

    const lessonTopics = await db
      .select({ id: topics.id, title: topics.title, topic_type: topics.topic_type })
      .from(topics)
      .where(eq(topics.lesson_id, lesson.id));

    const grammarTopics = lessonTopics.filter(t => t.topic_type === 'grammar_exercise');

    const quizzesMap = new Map<number, string>();
    for (const q of lessonQuizzes) {
      quizzesMap.set(q.id, q.quiz_type || '');
    }

    const gamesMap = new Map<number, string>();
    for (const g of lessonGames) {
      gamesMap.set(g.id, g.game_type || '');
    }

    const flow: FlowItem[] = [];

    flow.push({ key: 'vocab', type: 'vocab', title: 'Vocabulary Trainer' });

    for (const g of lessonGames) {
      if (g.game_type === 'vocab_run') {
        flow.push({ key: `game-${g.id}`, type: 'game', id: g.id, title: g.title });
      }
    }

    for (const g of lessonGames) {
      if (g.game_type === 'memory') {
        flow.push({ key: `game-${g.id}`, type: 'game', id: g.id, title: g.title });
      }
    }

    flow.push({ key: 'content', type: 'content', title: 'Lesson Content' });

    for (const q of lessonQuizzes) {
      if (q.quiz_type === 'multiple_choice') {
        flow.push({ key: `quiz-${q.id}`, type: 'quiz', id: q.id, title: q.title });
      }
    }

    for (const g of lessonGames) {
      if (g.game_type === 'listen_type') {
        flow.push({ key: `game-${g.id}`, type: 'game', id: g.id, title: g.title });
      }
    }

    for (const q of lessonQuizzes) {
      if (q.quiz_type === 'gap_fill') {
        flow.push({ key: `quiz-${q.id}`, type: 'quiz', id: q.id, title: q.title });
      }
    }

    for (const gr of grammarTopics) {
      flow.push({ key: `grammar-${gr.id}`, type: 'grammar', id: gr.id, title: gr.title });
    }

    for (const g of lessonGames) {
      if (g.game_type === 'word_search') {
        flow.push({ key: `game-${g.id}`, type: 'game', id: g.id, title: g.title });
      }
    }

    for (const g of lessonGames) {
      if (g.game_type === 'hangman') {
        flow.push({ key: `game-${g.id}`, type: 'game', id: g.id, title: g.title });
      }
    }

    flow.push({ key: 'cultural', type: 'cultural', title: 'Cultural Information' });

    for (const q of lessonQuizzes) {
      if (q.quiz_type === 'true_false') {
        flow.push({ key: `quiz-${q.id}`, type: 'quiz', id: q.id, title: q.title });
      }
    }

    // Add any remaining quizzes/games that don't match the standard types at the end
    const usedQuizIds = new Set(flow.filter(f => f.type === 'quiz' && f.id).map(f => f.id));
    const usedGameIds = new Set(flow.filter(f => f.type === 'game' && f.id).map(f => f.id));

    for (const q of lessonQuizzes) {
      if (!usedQuizIds.has(q.id)) {
        flow.push({ key: `quiz-${q.id}`, type: 'quiz', id: q.id, title: q.title });
      }
    }

    for (const g of lessonGames) {
      if (!usedGameIds.has(g.id)) {
        flow.push({ key: `game-${g.id}`, type: 'game', id: g.id, title: g.title });
      }
    }

    const existingFlow = Array.isArray(lesson.flow_order) ? lesson.flow_order as FlowItem[] : [];

    if (flowsAreEqual(existingFlow, flow)) {
      skipped++;
      continue;
    }

    await db
      .update(lessons)
      .set({ flow_order: flow, updated_at: new Date() })
      .where(eq(lessons.id, lesson.id));

    const flowSummary = flow.map(f => f.key).join(' → ');
    console.log(`✓ Lesson ${lesson.id} "${lesson.title}" updated (${flow.length} items): ${flowSummary}`);
    updated++;
  }

  console.log(`\nDone! Updated: ${updated}, Skipped (already correct): ${skipped}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
