import { db } from '../lib/db/drizzle';
import { lessons, courses, vocabulary } from '../lib/db/content-schema';
import { eq } from 'drizzle-orm';

/**
 * Map course title to difficulty level based on CEFR indicators
 */
function getDifficultyLevelFromCourseTitle(courseTitle: string): number {
  const title = (courseTitle || '').toUpperCase();
  
  // Check course title for CEFR level indicators
  if (title.includes('A1')) return 1;
  if (title.includes('A2')) return 2;
  if (title.includes('B1')) return 3;
  if (title.includes('B2')) return 4;
  if (title.includes('C1')) return 5;
  
  // Default fallback
  return 1;
}

/**
 * Update vocabulary difficulty levels based on course titles
 */
async function updateVocabularyLevels() {
  console.log('🔄 Starting vocabulary level update...\n');

  try {
    // Fetch all lessons with their course information
    const allLessons = await db
      .select({
        lessonId: lessons.id,
        lessonTitle: lessons.title,
        courseId: lessons.course_id,
        courseTitle: courses.title,
        courseLevel: courses.level,
      })
      .from(lessons)
      .innerJoin(courses, eq(lessons.course_id, courses.id));

    console.log(`📚 Found ${allLessons.length} lessons\n`);

    let totalUpdated = 0;
    let lessonsProcessed = 0;

    for (const lesson of allLessons) {
      // Determine the correct difficulty level from course title
      const targetLevel = getDifficultyLevelFromCourseTitle(lesson.courseTitle);

      // Get all vocabulary for this lesson
      const vocabItems = await db
        .select()
        .from(vocabulary)
        .where(eq(vocabulary.lesson_id, lesson.lessonId));

      if (vocabItems.length === 0) {
        continue;
      }

      // Count how many need updating
      const needsUpdate = vocabItems.filter(v => v.difficulty_level !== targetLevel);

      if (needsUpdate.length > 0) {
        // Update all vocabulary items for this lesson
        for (const vocab of needsUpdate) {
          await db
            .update(vocabulary)
            .set({ difficulty_level: targetLevel })
            .where(eq(vocabulary.id, vocab.id));
        }

        totalUpdated += needsUpdate.length;
        lessonsProcessed++;

        console.log(
          `✅ Lesson "${lesson.lessonTitle}" (Course: "${lesson.courseTitle}"): ` +
          `Updated ${needsUpdate.length} vocabulary items to Level ${targetLevel}`
        );
      }
    }

    console.log(`\n✨ Update complete!`);
    console.log(`   - Lessons processed: ${lessonsProcessed}`);
    console.log(`   - Total vocabulary items updated: ${totalUpdated}`);
  } catch (error) {
    console.error('❌ Error updating vocabulary levels:', error);
    throw error;
  }
}

// Run the script
updateVocabularyLevels()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

