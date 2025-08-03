import { db } from '@/lib/db/drizzle';
import { 
  learning_streaks, 
  point_transactions, 
  daily_activity, 
  achievements,
  completed_activities,
  type NewLearningStreak,
  type NewPointTransaction,
  type NewDailyActivity,
  type NewAchievement,
  type NewCompletedActivity
} from '@/lib/db/content-schema';
import { ActivityType } from '@/lib/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { logActivity } from '@/lib/activity-logger';

// Points configuration for different activities
export const POINTS_CONFIG = {
  COMPLETE_QUIZ: {
    base: 10,
    perfect_score_bonus: 20, // 100% score
    time_bonus: 10, // Completed quickly
  },
  COMPLETE_LESSON: {
    base: 15,
  },
  COMPLETE_VOCABULARY: {
    base: 5,
  },
  COMPLETE_GAME: {
    base: 8,
  },
  DAILY_STREAK: {
    day_1_7: 5,    // Points per day for days 1-7
    day_8_30: 10,  // Points per day for days 8-30
    day_31_plus: 15, // Points per day for 31+ days
  },
  ACHIEVEMENT_BONUS: {
    first_time: 50,
    milestone: 25,
  }
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = {
  first_quiz: {
    title: 'First Steps',
    description: 'Completed your first quiz!',
    icon: '🎯',
    points: 25,
  },
  quiz_perfectionist: {
    title: 'Perfectionist',
    description: 'Scored 100% on a quiz!',
    icon: '💯',
    points: 50,
  },
  streak_7_days: {
    title: 'Week Warrior',
    description: '7 days learning streak!',
    icon: '🔥',
    points: 100,
  },
  streak_30_days: {
    title: 'Month Master',
    description: '30 days learning streak!',
    icon: '🏆',
    points: 300,
  },
  streak_100_days: {
    title: 'Century Scholar',
    description: '100 days learning streak!',
    icon: '👑',
    points: 1000,
  },
  points_milestone_100: {
    title: 'Point Collector',
    description: 'Earned 100 total points!',
    icon: '⭐',
    points: 10,
  },
  points_milestone_500: {
    title: 'Point Master',
    description: 'Earned 500 total points!',
    icon: '🌟',
    points: 50,
  },
  points_milestone_1000: {
    title: 'Point Legend',
    description: 'Earned 1000 total points!',
    icon: '💫',
    points: 100,
  },
  lesson_completed: {
    title: 'Lesson Learner',
    description: 'Completed your first lesson!',
    icon: '📚',
    points: 25,
  },
};

/**
 * Check if student has already completed this specific activity
 */
async function hasCompletedActivity(
  studentId: number,
  activityType: string,
  referenceId: number
): Promise<{ completed: boolean; existingRecord?: any }> {
  try {
    const [existingCompletion] = await db
      .select()
      .from(completed_activities)
      .where(and(
        eq(completed_activities.student_id, studentId),
        eq(completed_activities.activity_type, activityType),
        eq(completed_activities.reference_id, referenceId)
      ))
      .limit(1);

    return {
      completed: !!existingCompletion,
      existingRecord: existingCompletion
    };
  } catch (error) {
    console.error('Error checking completed activity:', error);
    return { completed: false };
  }
}

/**
 * Record or update completed activity
 */
async function recordCompletedActivity(
  studentId: number,
  activityType: string,
  referenceId: number,
  pointsAwarded: number,
  metadata?: any,
  existingRecord?: any
) {
  try {
    const currentScore = metadata?.score ? parseFloat(metadata.score.toString()) : null;
    
    if (existingRecord) {
      // Update existing record
      const newCompletionCount = (existingRecord.completion_count || 0) + 1;
      const bestScore = currentScore ? 
        Math.max(parseFloat(existingRecord.best_score || '0'), currentScore) : 
        existingRecord.best_score;

      await db
        .update(completed_activities)
        .set({
          completion_count: newCompletionCount,
          latest_score: currentScore ? currentScore.toString() : existingRecord.latest_score,
          best_score: bestScore ? bestScore.toString() : existingRecord.best_score,
          points_awarded: (existingRecord.points_awarded || 0) + pointsAwarded,
          metadata: metadata ? JSON.stringify(metadata) : existingRecord.metadata,
        })
        .where(eq(completed_activities.id, existingRecord.id));
    } else {
      // Create new record
      await db.insert(completed_activities).values({
        student_id: studentId,
        activity_type: activityType,
        reference_id: referenceId,
        completion_count: 1,
        best_score: currentScore ? currentScore.toString() : null,
        latest_score: currentScore ? currentScore.toString() : null,
        points_awarded: pointsAwarded,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });
    }
  } catch (error) {
    console.error('Error recording completed activity:', error);
  }
}

/**
 * Award points to a student for completing an activity
 */
export async function awardPoints(
  studentId: number,
  activityType: keyof typeof POINTS_CONFIG,
  referenceId?: number,
  referenceType?: string,
  language?: string,
  metadata?: any
): Promise<number> {
  try {
    // Check if this is a trackable activity with a reference ID
    if (referenceId && referenceType) {
      const { completed, existingRecord } = await hasCompletedActivity(
        studentId, 
        referenceType, 
        referenceId
      );

      if (completed) {
        // Student has already completed this activity
        console.log(`Student ${studentId} has already completed ${referenceType} ${referenceId}`);
        
        // For quiz retakes, check if they improved their score
        if (referenceType === 'quiz' && metadata?.score) {
          const previousBestScore = parseFloat(existingRecord?.best_score || '0');
          const currentScore = parseFloat(metadata.score.toString());
          
          if (currentScore > previousBestScore) {
            // Award improvement bonus (25% of original points)
            const config = POINTS_CONFIG[activityType];
            const improvementPoints = Math.round(((config && 'base' in config) ? config.base : 0) * 0.25);
            
            if (improvementPoints > 0) {
              await db.insert(point_transactions).values({
                student_id: studentId,
                activity_type: 'IMPROVEMENT_BONUS',
                points_change: improvementPoints,
                description: `Score improvement: ${previousBestScore}% → ${currentScore}%`,
                reference_id: referenceId,
                reference_type: referenceType,
                language,
                metadata: metadata ? JSON.stringify(metadata) : null,
              });

              // Update streak and daily activity with improvement points
              await updateLearningStreaks(studentId, improvementPoints);
              await updateDailyActivity(studentId, 'IMPROVEMENT_BONUS', improvementPoints, language);
              
              // Record the completion with improvement
              await recordCompletedActivity(
                studentId, 
                referenceType, 
                referenceId, 
                improvementPoints, 
                metadata, 
                existingRecord
              );

              console.log(`✅ Awarded ${improvementPoints} improvement points to student ${studentId}`);
              return improvementPoints;
            }
          }
        }

        // Just update the completion record without awarding points
        await recordCompletedActivity(
          studentId, 
          referenceType, 
          referenceId, 
          0, 
          metadata, 
          existingRecord
        );
        
        return 0; // No points awarded for repeat completion
      }
    }

    // Calculate points based on activity type and metadata
    const config = POINTS_CONFIG[activityType];
    let pointsToAward = (config && 'base' in config) ? config.base : 0;
    let description = `Completed ${activityType.toLowerCase().replace('_', ' ')}`;

    // Add bonuses based on metadata
    if (activityType === 'COMPLETE_QUIZ' && metadata) {
      if (metadata.score >= 100) {
        pointsToAward += POINTS_CONFIG.COMPLETE_QUIZ.perfect_score_bonus;
        description += ' with perfect score!';
      }
      if (metadata.timeBonus) {
        pointsToAward += POINTS_CONFIG.COMPLETE_QUIZ.time_bonus;
        description += ' quickly';
      }
    }

    // Record the point transaction
    await db.insert(point_transactions).values({
      student_id: studentId,
      activity_type: activityType,
      points_change: pointsToAward,
      description,
      reference_id: referenceId,
      reference_type: referenceType,
      language,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    // Update total points in learning streaks
    await updateLearningStreaks(studentId, pointsToAward);

    // Update daily activity
    await updateDailyActivity(studentId, activityType, pointsToAward, language);

    // Record this as a completed activity (first time)
    if (referenceId && referenceType) {
      await recordCompletedActivity(
        studentId, 
        referenceType, 
        referenceId, 
        pointsToAward, 
        metadata
      );
    }

    // Check for achievements
    await checkAchievements(studentId, activityType, metadata);

    // Log the activity
    await logActivity(ActivityType.EARN_POINTS);

    console.log(`✅ Awarded ${pointsToAward} points to student ${studentId} for ${activityType}`);
    return pointsToAward;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Update or create learning streaks for a student
 */
async function updateLearningStreaks(studentId: number, pointsEarned: number) {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get existing streak data
    const [existingStreak] = await db
      .select()
      .from(learning_streaks)
      .where(eq(learning_streaks.student_id, studentId))
      .limit(1);

    if (existingStreak) {
      // Check if this is a consecutive day
      const lastActivityDate = existingStreak.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = existingStreak.current_streak || 0;
      
      if (lastActivityDate === today) {
        // Already counted today, just update points
      } else if (lastActivityDate === yesterdayStr) {
        // Consecutive day - increase streak
        newCurrentStreak += 1;
      } else {
        // Streak broken - reset to 1
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(existingStreak.longest_streak || 0, newCurrentStreak);

      await db
        .update(learning_streaks)
        .set({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          total_points: (existingStreak.total_points || 0) + pointsEarned,
          updated_at: new Date(),
        })
        .where(eq(learning_streaks.student_id, studentId));

      // Check for streak achievements
      if (newCurrentStreak > (existingStreak.current_streak || 0)) {
        await checkStreakAchievements(studentId, newCurrentStreak);
      }
    } else {
      // Create new streak record
      await db.insert(learning_streaks).values({
        student_id: studentId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
        total_points: pointsEarned,
      });

      // Award first day achievement if it exists
      await checkStreakAchievements(studentId, 1);
    }
  } catch (error) {
    console.error('Error updating learning streaks:', error);
    throw error;
  }
}

/**
 * Update daily activity tracking
 */
async function updateDailyActivity(
  studentId: number, 
  activityType: string, 
  pointsEarned: number, 
  language?: string
) {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get existing daily activity
    const [existingActivity] = await db
      .select()
      .from(daily_activity)
      .where(and(
        eq(daily_activity.student_id, studentId),
        eq(daily_activity.activity_date, today)
      ))
      .limit(1);

    const activityIncrements: any = {
      points_earned: pointsEarned,
    };

    // Increment specific activity counters
    if (activityType.includes('QUIZ')) {
      activityIncrements.quizzes_completed = 1;
    } else if (activityType.includes('LESSON')) {
      activityIncrements.lessons_completed = 1;
    } else if (activityType.includes('VOCABULARY')) {
      activityIncrements.vocabulary_practiced = 1;
    } else if (activityType.includes('GAME')) {
      activityIncrements.games_played = 1;
    }

    if (existingActivity) {
      // Update existing record
      const currentLanguages = existingActivity.languages_practiced;
      const updatedLanguages = Array.isArray(currentLanguages) ? currentLanguages : [];
      if (language && !updatedLanguages.includes(language)) {
        updatedLanguages.push(language);
      }

      await db
        .update(daily_activity)
        .set({
          points_earned: (existingActivity.points_earned || 0) + pointsEarned,
          lessons_completed: (existingActivity.lessons_completed || 0) + (activityIncrements.lessons_completed || 0),
          quizzes_completed: (existingActivity.quizzes_completed || 0) + (activityIncrements.quizzes_completed || 0),
          vocabulary_practiced: (existingActivity.vocabulary_practiced || 0) + (activityIncrements.vocabulary_practiced || 0),
          games_played: (existingActivity.games_played || 0) + (activityIncrements.games_played || 0),
          languages_practiced: JSON.stringify(updatedLanguages),
          updated_at: new Date(),
        })
        .where(and(
          eq(daily_activity.student_id, studentId),
          eq(daily_activity.activity_date, today)
        ));
    } else {
      // Create new daily activity record
      await db.insert(daily_activity).values({
        student_id: studentId,
        activity_date: today,
        points_earned: pointsEarned,
        lessons_completed: activityIncrements.lessons_completed || 0,
        quizzes_completed: activityIncrements.quizzes_completed || 0,
        vocabulary_practiced: activityIncrements.vocabulary_practiced || 0,
        games_played: activityIncrements.games_played || 0,
        languages_practiced: language ? JSON.stringify([language]) : JSON.stringify([]),
      });
    }
  } catch (error) {
    console.error('Error updating daily activity:', error);
    throw error;
  }
}

/**
 * Check and award achievements based on activity
 */
async function checkAchievements(studentId: number, activityType: string, metadata?: any) {
  try {
    const achievementsToCheck = [];

    // Activity-specific achievements
    if (activityType === 'COMPLETE_QUIZ') {
      // Check if this is their first quiz
      const [existingQuizAchievement] = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.student_id, studentId),
          eq(achievements.achievement_type, 'first_quiz')
        ))
        .limit(1);

      if (!existingQuizAchievement) {
        achievementsToCheck.push('first_quiz');
      }

      // Check for perfect score
      if (metadata?.score >= 100) {
        const [existingPerfectAchievement] = await db
          .select()
          .from(achievements)
          .where(and(
            eq(achievements.student_id, studentId),
            eq(achievements.achievement_type, 'quiz_perfectionist')
          ))
          .limit(1);

        if (!existingPerfectAchievement) {
          achievementsToCheck.push('quiz_perfectionist');
        }
      }
    }

    if (activityType === 'COMPLETE_LESSON') {
      const [existingLessonAchievement] = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.student_id, studentId),
          eq(achievements.achievement_type, 'lesson_completed')
        ))
        .limit(1);

      if (!existingLessonAchievement) {
        achievementsToCheck.push('lesson_completed');
      }
    }

    // Check point milestones
    const [streakData] = await db
      .select()
      .from(learning_streaks)
      .where(eq(learning_streaks.student_id, studentId))
      .limit(1);

    if (streakData) {
      const totalPoints = streakData.total_points || 0;
      const milestones = [
        { points: 100, type: 'points_milestone_100' },
        { points: 500, type: 'points_milestone_500' },
        { points: 1000, type: 'points_milestone_1000' },
      ];

      for (const milestone of milestones) {
        if (totalPoints >= milestone.points) {
          const [existingMilestone] = await db
            .select()
            .from(achievements)
            .where(and(
              eq(achievements.student_id, studentId),
              eq(achievements.achievement_type, milestone.type as any)
            ))
            .limit(1);

          if (!existingMilestone) {
            achievementsToCheck.push(milestone.type);
          }
        }
      }
    }

    // Award all new achievements
    for (const achievementType of achievementsToCheck) {
      await awardAchievement(studentId, achievementType as keyof typeof ACHIEVEMENT_DEFINITIONS);
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

/**
 * Check and award streak-based achievements
 */
async function checkStreakAchievements(studentId: number, currentStreak: number) {
  try {
    const streakAchievements = [
      { days: 7, type: 'streak_7_days' },
      { days: 30, type: 'streak_30_days' },
      { days: 100, type: 'streak_100_days' },
    ];

    for (const streak of streakAchievements) {
      if (currentStreak >= streak.days) {
        const [existingAchievement] = await db
          .select()
          .from(achievements)
          .where(and(
            eq(achievements.student_id, studentId),
            eq(achievements.achievement_type, streak.type as any)
          ))
          .limit(1);

        if (!existingAchievement) {
          await awardAchievement(studentId, streak.type as keyof typeof ACHIEVEMENT_DEFINITIONS);
        }
      }
    }
  } catch (error) {
    console.error('Error checking streak achievements:', error);
  }
}

/**
 * Award a specific achievement to a student
 */
async function awardAchievement(studentId: number, achievementType: keyof typeof ACHIEVEMENT_DEFINITIONS) {
  try {
    const achievement = ACHIEVEMENT_DEFINITIONS[achievementType];
    if (!achievement) return;

    await db.insert(achievements).values({
      student_id: studentId,
      achievement_type: achievementType,
      title: achievement.title,
      description: achievement.description,
      badge_icon: achievement.icon,
      points_earned: achievement.points,
    });

    // Award bonus points for the achievement
    await db.insert(point_transactions).values({
      student_id: studentId,
      activity_type: 'EARN_ACHIEVEMENT',
      points_change: achievement.points,
      description: `Achievement unlocked: ${achievement.title}`,
      reference_type: 'achievement',
      metadata: JSON.stringify({ achievement_type: achievementType }),
    });

    // Update total points
    const [streakData] = await db
      .select()
      .from(learning_streaks)
      .where(eq(learning_streaks.student_id, studentId))
      .limit(1);

    if (streakData) {
      await db
        .update(learning_streaks)
        .set({
          total_points: (streakData.total_points || 0) + achievement.points,
          updated_at: new Date(),
        })
        .where(eq(learning_streaks.student_id, studentId));
    }

    // Log the achievement
    await logActivity(ActivityType.EARN_ACHIEVEMENT);

    console.log(`🏆 Achievement unlocked for student ${studentId}: ${achievement.title}`);
  } catch (error) {
    console.error('Error awarding achievement:', error);
  }
}

/**
 * Get student progress summary
 */
export async function getStudentProgress(studentId: number) {
  try {
    const [streakData] = await db
      .select()
      .from(learning_streaks)
      .where(eq(learning_streaks.student_id, studentId))
      .limit(1);

    const studentAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.student_id, studentId))
      .orderBy(desc(achievements.earned_at));

    const recentTransactions = await db
      .select()
      .from(point_transactions)
      .where(eq(point_transactions.student_id, studentId))
      .orderBy(desc(point_transactions.created_at))
      .limit(10);

    // Get recent daily activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const recentActivity = await db
      .select()
      .from(daily_activity)
      .where(and(
        eq(daily_activity.student_id, studentId),
        gte(daily_activity.activity_date, sevenDaysAgoStr)
      ))
      .orderBy(desc(daily_activity.activity_date));

    // Get completed activities summary
    const completedActivities = await db
      .select()
      .from(completed_activities)
      .where(eq(completed_activities.student_id, studentId))
      .orderBy(desc(completed_activities.first_completed_at));

    // Calculate completion statistics
    const completionStats = {
      total_completions: completedActivities.length,
      quizzes_completed: completedActivities.filter(a => a.activity_type === 'quiz').length,
      lessons_completed: completedActivities.filter(a => a.activity_type === 'lesson').length,
      vocabulary_completed: completedActivities.filter(a => a.activity_type === 'vocabulary').length,
      games_completed: completedActivities.filter(a => a.activity_type === 'game').length,
      average_score: completedActivities
        .filter(a => a.best_score)
        .reduce((sum, a) => sum + parseFloat(a.best_score!), 0) / 
        (completedActivities.filter(a => a.best_score).length || 1),
    };

    return {
      streak: streakData || null,
      achievements: studentAchievements,
      recentTransactions,
      recentActivity,
      completedActivities,
      completionStats,
    };
  } catch (error) {
    console.error('Error getting student progress:', error);
    throw error;
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit: number = 10) {
  try {
    const leaderboard = await db
      .select({
        student_id: learning_streaks.student_id,
        total_points: learning_streaks.total_points,
        current_streak: learning_streaks.current_streak,
        longest_streak: learning_streaks.longest_streak,
      })
      .from(learning_streaks)
      .orderBy(desc(learning_streaks.total_points))
      .limit(limit);

    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}