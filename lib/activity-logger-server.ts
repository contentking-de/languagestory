import { db } from '@/lib/db/drizzle';
import { activityLogs, type NewActivityLog } from '@/lib/db/schema';
import { ActivityType } from '@/lib/db/schema';
import { getUserWithTeamData } from '@/lib/db/queries';

/**
 * Log an activity for the current user (server-side)
 * @param type - The type of activity being logged
 * @param ipAddress - Optional IP address of the user
 */
export async function logActivityServer(
  type: ActivityType,
  ipAddress?: string
): Promise<void> {
  try {
    const user = await getUserWithTeamData();
    if (!user) {
      console.warn('No user found, activity not logged');
      return;
    }

    // Get user's team ID (required for activity logging)
    const teamId = user.teamId;
    if (!teamId) {
      console.warn('No team ID found for user, activity not logged');
      return;
    }

    const newActivity: NewActivityLog = {
      teamId,
      userId: user.id,
      action: type,
      ipAddress: ipAddress || '',
      language: null, // Optional field
      metadata: null  // Optional field
    };

    await db.insert(activityLogs).values(newActivity);
    console.log(`Activity logged: ${type} for user ${user.id}`);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

/**
 * Log a quiz-related activity (server-side)
 */
export async function logQuizActivityServer(
  type: 'CREATE_QUIZ' | 'TAKE_QUIZ' | 'COMPLETE_QUIZ',
  ipAddress?: string
): Promise<void> {
  await logActivityServer(ActivityType[type], ipAddress);
}

/**
 * Log a vocabulary-related activity (server-side)
 */
export async function logVocabularyActivityServer(
  type: 'CREATE_VOCABULARY' | 'STUDY_VOCABULARY',
  ipAddress?: string
): Promise<void> {
  await logActivityServer(ActivityType[type], ipAddress);
}

/**
 * Log a game-related activity (server-side)
 */
export async function logGameActivityServer(
  type: 'CREATE_GAME' | 'PLAY_GAME',
  ipAddress?: string
): Promise<void> {
  await logActivityServer(ActivityType[type], ipAddress);
}