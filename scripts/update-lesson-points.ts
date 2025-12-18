import { db } from '../lib/db/drizzle';
import { lessons } from '../lib/db/content-schema';
import { ne, or, isNull } from 'drizzle-orm';

/**
 * Update all existing lessons to have 300 points_value
 */
async function updateLessonPoints() {
  console.log('🔄 Starting lesson points update...\n');

  try {
    // First, get count of lessons that need updating
    const lessonsToUpdate = await db
      .select({ id: lessons.id, points_value: lessons.points_value })
      .from(lessons)
      .where(or(ne(lessons.points_value, 300), isNull(lessons.points_value)));

    console.log(`📚 Found ${lessonsToUpdate.length} lessons to update\n`);

    if (lessonsToUpdate.length === 0) {
      console.log('✅ All lessons already have 300 points!');
      return;
    }

    // Update all lessons to 300 points
    await db
      .update(lessons)
      .set({ 
        points_value: 300,
        updated_at: new Date()
      })
      .where(or(ne(lessons.points_value, 300), isNull(lessons.points_value)));

    console.log(`✅ Updated ${lessonsToUpdate.length} lessons to 300 points`);
    console.log(`\n✨ Update complete!`);
  } catch (error) {
    console.error('❌ Error updating lesson points:', error);
    throw error;
  }
}

// Run the script
updateLessonPoints()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
