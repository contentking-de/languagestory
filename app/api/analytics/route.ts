import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses, lessons, quizzes, institutions, users } from '@/lib/db/schema';
import { count, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total counts
    const [coursesCount] = await db.select({ count: count() }).from(courses);
    const [lessonsCount] = await db.select({ count: count() }).from(lessons);
    const [quizzesCount] = await db.select({ count: count() }).from(quizzes);
    const [institutionsCount] = await db.select({ count: count() }).from(institutions);
    const [usersCount] = await db.select({ count: count() }).from(users);

    // Get published content percentage
    const [publishedCourses] = await db
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.is_published, true));

    const [publishedLessons] = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.is_published, true));

    const totalContent = coursesCount.count + lessonsCount.count;
    const publishedContent = publishedCourses.count + publishedLessons.count;
    const publishedPercentage = totalContent > 0 ? Math.round((publishedContent / totalContent) * 100) : 0;

    // Language breakdown
    const languageBreakdown = await db
      .select({
        language: courses.language,
        count: count()
      })
      .from(courses)
      .groupBy(courses.language);

    const languageBreakdownWithFlags = languageBreakdown.map(lang => ({
      ...lang,
      flag: lang.language === 'french' ? '🇫🇷' : 
            lang.language === 'german' ? '🇩🇪' : 
            lang.language === 'spanish' ? '🇪🇸' : '🌐'
    }));

    // Institution types
    const institutionTypes = await db
      .select({
        type: institutions.type,
        count: count()
      })
      .from(institutions)
      .groupBy(institutions.type);

    // Content types (lesson types)
    const contentTypes = await db
      .select({
        type: lessons.lesson_type,
        count: count()
      })
      .from(lessons)
      .groupBy(lessons.lesson_type);

    // Mock monthly growth data (you can implement this with real date-based queries)
    const monthlyGrowth = [
      { month: 'Jan', courses: 2, lessons: 15 },
      { month: 'Feb', courses: 3, lessons: 22 },
      { month: 'Mar', courses: 1, lessons: 18 },
      { month: 'Apr', courses: 4, lessons: 20 },
    ];

    const analyticsData = {
      totalCourses: coursesCount.count,
      totalLessons: lessonsCount.count,
      totalQuizzes: quizzesCount.count,
      totalInstitutions: institutionsCount.count,
      totalUsers: usersCount.count,
      publishedContent: publishedPercentage,
      languageBreakdown: languageBreakdownWithFlags,
      institutionTypes,
      contentTypes,
      monthlyGrowth,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 