import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses, lessons, quizzes, vocabulary } from '@/lib/db/schema';
import { count, eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total counts
    const [coursesCount] = await db.select({ count: count() }).from(courses);
    const [lessonsCount] = await db.select({ count: count() }).from(lessons);
    const [quizzesCount] = await db.select({ count: count() }).from(quizzes);
    const [vocabularyCount] = await db.select({ count: count() }).from(vocabulary);

    // Get published counts
    const [publishedCourses] = await db
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.is_published, true));

    const [publishedLessons] = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.is_published, true));

    // Language statistics
    const languageStats = await db
      .select({
        language: courses.language,
        courses: count()
      })
      .from(courses)
      .groupBy(courses.language);

    const languageStatsWithFlags = languageStats.map(lang => ({
      ...lang,
      flag: lang.language === 'french' ? '🇫🇷' : 
            lang.language === 'german' ? '🇩🇪' : 
            lang.language === 'spanish' ? '🇪🇸' : '🌐'
    }));

    // Recent content - combining courses, lessons, and quizzes
    const recentCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        created_at: courses.created_at,
        language: courses.language,
      })
      .from(courses)
      .orderBy(desc(courses.created_at))
      .limit(3);

    const recentLessons = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        created_at: lessons.created_at,
        language: courses.language,
      })
      .from(lessons)
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .orderBy(desc(lessons.created_at))
      .limit(3);

    const recentQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        created_at: quizzes.created_at,
        language: courses.language,
      })
      .from(quizzes)
      .leftJoin(lessons, eq(quizzes.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .orderBy(desc(quizzes.created_at))
      .limit(3);

    // Combine and sort recent content
    const recentContent = [
      ...recentCourses.map(item => ({ ...item, type: 'course' })),
      ...recentLessons.map(item => ({ ...item, type: 'lesson' })),
      ...recentQuizzes.map(item => ({ ...item, type: 'quiz' }))
    ]
      .filter(item => item.created_at) // Filter out items without created_at
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 10);

    const contentStats = {
      totalCourses: coursesCount.count,
      totalLessons: lessonsCount.count,
      totalQuizzes: quizzesCount.count,
      totalVocabulary: vocabularyCount.count,
      publishedCourses: publishedCourses.count,
      publishedLessons: publishedLessons.count,
      languageStats: languageStatsWithFlags,
      recentContent: recentContent.filter(item => item.language), // Filter out items without language
    };

    return NextResponse.json(contentStats);
  } catch (error) {
    console.error('Error fetching content stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content stats' },
      { status: 500 }
    );
  }
} 