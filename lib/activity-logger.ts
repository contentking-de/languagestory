import { ActivityType } from '@/lib/db/schema';

/**
 * Log an activity for the current user (client-side)
 * @param type - The type of activity being logged
 * @param ipAddress - Optional IP address of the user
 */
export async function logActivity(
  type: ActivityType,
  ipAddress?: string
): Promise<void> {
  try {
    // Only run on client side
    if (typeof window === 'undefined') {
      console.warn('Activity logging should only be called from client side');
      return;
    }

    console.log(`Attempting to log activity: ${type}`); // Debug log
    
    const response = await fetch('/api/activity/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityType: type,
        ipAddress: ipAddress || ''
      }),
    });

    if (response.ok) {
      console.log(`✅ Activity logged successfully: ${type}`);
    } else {
      const errorText = await response.text();
      console.warn(`❌ Failed to log activity: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

/**
 * Log a quiz-related activity
 */
export async function logQuizActivity(
  type: 'CREATE_QUIZ' | 'TAKE_QUIZ' | 'COMPLETE_QUIZ',
  ipAddress?: string
): Promise<void> {
  await logActivity(ActivityType[type], ipAddress);
}

/**
 * Log a vocabulary-related activity
 */
export async function logVocabularyActivity(
  type: 'CREATE_VOCABULARY' | 'STUDY_VOCABULARY',
  ipAddress?: string
): Promise<void> {
  await logActivity(ActivityType[type], ipAddress);
}

/**
 * Log a game-related activity
 */
export async function logGameActivity(
  type: 'CREATE_GAME' | 'PLAY_GAME',
  ipAddress?: string
): Promise<void> {
  await logActivity(ActivityType[type], ipAddress);
}