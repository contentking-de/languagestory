import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  json,
  date,
  pgEnum,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, institutions, classes } from './schema';

// Additional enums for content management
export const levelEnum = pgEnum('level', ['beginner', 'intermediate', 'advanced']);
export const lessonTypeEnum = pgEnum('lesson_type', ['story', 'game', 'vocabulary', 'grammar', 'culture', 'assessment']);
export const topicTypeEnum = pgEnum('topic_type', [
  'story_page', 'comprehension_quiz', 'listening_gap_fill', 'vocabulary_game', 
  'anagram', 'matching_pairs', 'find_the_match', 'cultural_note', 'grammar_exercise',
  'audio_exercise', 'video_content', 'interactive_game'
]);
export const quizTypeEnum = pgEnum('quiz_type', [
  // New interactive quiz types
  'multiple_choice', 
  'gap_fill', 
  'true_false',
  // Legacy content-based types
  'comprehension', 
  'vocabulary', 
  'grammar', 
  'listening', 
  'speaking', 
  'writing'
]);
export const questionTypeEnum = pgEnum('question_type', ['multiple_choice', 'true_false', 'fill_blank', 'matching', 'ordering', 'short_answer']);
export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed', 'mastered']);
export const achievementTypeEnum = pgEnum('achievement_type', [
  'story_completed', 'quiz_master', 'streak_7_days', 'streak_30_days', 'streak_100_days',
  'perfect_score', 'fast_learner', 'culture_expert', 'vocabulary_champion',
  'first_quiz', 'quiz_perfectionist', 'lesson_completed', 'course_completed',
  'points_milestone_100', 'points_milestone_500', 'points_milestone_1000', 'points_milestone_5000',
  'daily_learner', 'weekly_warrior', 'monthly_master', 'vocabulary_collector',
  'game_champion', 'pronunciation_pro', 'grammar_guru', 'speaking_star'
]);
export const cultureTypeEnum = pgEnum('culture_type', ['food', 'festival', 'tradition', 'geography', 'history', 'art', 'music']);
export const gameCategoryEnum = pgEnum('game_category', [
  'french', 'german', 'spanish', 'english', 'math', 'science', 'history', 
  'geography', 'vocabulary', 'grammar', 'general', 'quiz', 'matching', 'other'
]);

export const gameTypeEnum = pgEnum('game_type', [
  'wordwall', 'memory', 'hangman', 'word_search', 'crossword', 'flashcards',
  'fill_blank', 'multiple_choice', 'drag_drop', 'word_mixup', 'custom'
]);

// Main Courses table
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  language: varchar('language', { length: 20 }).notNull(), // french, german, spanish
  level: levelEnum('level').default('beginner'),
  institution_id: integer('institution_id'),
  created_by: integer('created_by').notNull(),
  is_published: boolean('is_published').default(false),
  course_order: integer('course_order').default(0),
  estimated_duration: integer('estimated_duration'), // total minutes
  total_lessons: integer('total_lessons').default(0),
  total_points: integer('total_points').default(0),
  cover_image: varchar('cover_image', { length: 255 }),
  wp_course_id: integer('wp_course_id'), // Reference to original WordPress course
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Lessons within courses
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  course_id: integer('course_id').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  description: text('description'),
  content: text('content'), // Main lesson content/story
  lesson_type: lessonTypeEnum('lesson_type').default('story'),
  lesson_order: integer('lesson_order').default(0),
  estimated_duration: integer('estimated_duration'), // minutes
  points_value: integer('points_value').default(50),
  is_published: boolean('is_published').default(false),
  prerequisite_lesson_id: integer('prerequisite_lesson_id'),
  cover_image: varchar('cover_image', { length: 255 }),
  audio_file: varchar('audio_file', { length: 255 }),
  video_file: varchar('video_file', { length: 255 }),
  cultural_information: text('cultural_information'), // Cultural context and information
  // Audio storage fields for cultural information TTS
  cultural_audio_blob_id: varchar('cultural_audio_blob_id', { length: 255 }),
  cultural_audio_url: text('cultural_audio_url'),
  cultural_audio_generated_at: timestamp('cultural_audio_generated_at'),
  wp_lesson_id: integer('wp_lesson_id'), // Reference to original WordPress lesson
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Topics/Activities within lessons
export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  lesson_id: integer('lesson_id').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  content: text('content'),
  topic_type: topicTypeEnum('topic_type').notNull(),
  topic_order: integer('topic_order').default(0),
  audio_file: varchar('audio_file', { length: 255 }),
  video_file: varchar('video_file', { length: 255 }),
  difficulty_level: integer('difficulty_level').default(1), // 1-5 scale
  points_value: integer('points_value').default(10),
  time_limit: integer('time_limit'), // seconds for timed activities
  is_published: boolean('is_published').default(false),
  interactive_data: json('interactive_data'), // Game configs, quiz data, etc.
  wp_topic_id: integer('wp_topic_id'), // Reference to original WordPress topic
  created_at: timestamp('created_at').defaultNow(),
});

// Quizzes and Assessments
export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  lesson_id: integer('lesson_id'),
  topic_id: integer('topic_id'),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  quiz_type: quizTypeEnum('quiz_type').default('comprehension'),
  pass_percentage: integer('pass_percentage').default(70),
  time_limit: integer('time_limit'), // minutes
  max_attempts: integer('max_attempts').default(3),
  points_value: integer('points_value').default(25),
  is_published: boolean('is_published').default(false),
  wp_quiz_id: integer('wp_quiz_id'), // Reference to original WordPress quiz
  created_at: timestamp('created_at').defaultNow(),
});

// Quiz Questions
export const quiz_questions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').notNull(),
  question_text: text('question_text').notNull(),
  question_type: questionTypeEnum('question_type').notNull(),
  correct_answer: text('correct_answer'),
  answer_options: json('answer_options'), // Array of possible answers
  explanation: text('explanation'),
  points: integer('points').default(1),
  question_order: integer('question_order').default(0),
  audio_file: varchar('audio_file', { length: 255 }),
  image_file: varchar('image_file', { length: 255 }),
  wp_question_id: integer('wp_question_id'), // Reference to original WordPress question
});

// Student Progress Tracking
export const student_progress = pgTable('student_progress', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(),
  course_id: integer('course_id'),
  lesson_id: integer('lesson_id'),
  topic_id: integer('topic_id'),
  quiz_id: integer('quiz_id'),
  status: progressStatusEnum('status').default('not_started'),
  score: decimal('score', { precision: 5, scale: 2 }), // percentage score
  time_spent: integer('time_spent').default(0), // seconds
  attempts: integer('attempts').default(0),
  best_score: decimal('best_score', { precision: 5, scale: 2 }),
  points_earned: integer('points_earned').default(0),
  last_accessed: timestamp('last_accessed').defaultNow(),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow(),
});

// Vocabulary Management
export const vocabulary = pgTable('vocabulary', {
  id: serial('id').primaryKey(),
  word_french: varchar('word_french', { length: 100 }),
  word_german: varchar('word_german', { length: 100 }),
  word_spanish: varchar('word_spanish', { length: 100 }),
  word_english: varchar('word_english', { length: 100 }).notNull(),
  pronunciation: varchar('pronunciation', { length: 200 }),
  phonetic: varchar('phonetic', { length: 200 }),
  audio_file: varchar('audio_file', { length: 255 }),
  image_file: varchar('image_file', { length: 255 }),
  context_sentence: text('context_sentence'),
  cultural_note: text('cultural_note'),
  difficulty_level: integer('difficulty_level').default(1),
  word_type: varchar('word_type', { length: 50 }), // noun, verb, adjective, etc.
  lesson_id: integer('lesson_id'),
  topic_id: integer('topic_id'),
  // Audio storage fields for TTS
  audio_blob_id: varchar('audio_blob_id', { length: 255 }),
  audio_url: text('audio_url'),
  audio_generated_at: timestamp('audio_generated_at'),
  created_at: timestamp('created_at').defaultNow(),
});

// Cultural Content
export const cultural_content = pgTable('cultural_content', {
  id: serial('id').primaryKey(),
  lesson_id: integer('lesson_id'),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  content: text('content'),
  culture_type: cultureTypeEnum('culture_type').notNull(),
  language: varchar('language', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }),
  region: varchar('region', { length: 100 }),
  image_url: varchar('image_url', { length: 255 }),
  video_url: varchar('video_url', { length: 255 }),
  audio_url: varchar('audio_url', { length: 255 }),
  external_links: json('external_links'), // Array of related links
  is_published: boolean('is_published').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

// Wordwall Games
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  game_type: gameTypeEnum('game_type').default('wordwall'), // Type of game
  original_url: varchar('original_url', { length: 500 }), // Optional for custom games
  normalized_url: varchar('normalized_url', { length: 500 }), // Optional for custom games
  embed_html: text('embed_html'), // Optional for custom games
  thumbnail_url: varchar('thumbnail_url', { length: 500 }),
  author_name: varchar('author_name', { length: 200 }),
  author_url: varchar('author_url', { length: 500 }),
  provider_name: varchar('provider_name', { length: 100 }).default('Custom'),
  provider_url: varchar('provider_url', { length: 500 }),
  width: integer('width'),
  height: integer('height'),
  category: gameCategoryEnum('category').default('general'),
  language: varchar('language', { length: 20 }),
  difficulty_level: integer('difficulty_level').default(1), // 1-5 scale
  estimated_duration: integer('estimated_duration'), // in minutes
  lesson_id: integer('lesson_id'), // Assign game to a specific lesson
  tags: json('tags'), // Array of tag strings
  game_config: json('game_config'), // Game-specific configuration data
  is_active: boolean('is_active').default(true),
  is_featured: boolean('is_featured').default(false),
  added_by: integer('added_by').notNull(), // User ID who added the game
  usage_count: integer('usage_count').default(0), // Track how often it's used
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Student Achievements
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(),
  achievement_type: achievementTypeEnum('achievement_type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  language: varchar('language', { length: 20 }),
  badge_icon: varchar('badge_icon', { length: 255 }),
  points_earned: integer('points_earned').default(0),
  earned_at: timestamp('earned_at').defaultNow(),
  course_id: integer('course_id'),
  lesson_id: integer('lesson_id'),
});

// Learning Streaks
export const learning_streaks = pgTable('learning_streaks', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull().unique(),
  current_streak: integer('current_streak').default(0),
  longest_streak: integer('longest_streak').default(0),
  last_activity_date: date('last_activity_date'),
  total_points: integer('total_points').default(0),
  total_lessons: integer('total_lessons').default(0),
  total_time_minutes: integer('total_time_minutes').default(0),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Points Transactions - Detailed tracking of points earned/spent
export const point_transactions = pgTable('point_transactions', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(),
  activity_type: varchar('activity_type', { length: 50 }).notNull(), // COMPLETE_QUIZ, COMPLETE_LESSON, etc.
  points_change: integer('points_change').notNull(), // Can be positive (earned) or negative (spent)
  description: varchar('description', { length: 255 }).notNull(),
  reference_id: integer('reference_id'), // ID of quiz, lesson, etc.
  reference_type: varchar('reference_type', { length: 50 }), // 'quiz', 'lesson', 'vocabulary', etc.
  language: varchar('language', { length: 20 }),
  metadata: json('metadata'), // Additional context (score, time taken, etc.)
  created_at: timestamp('created_at').defaultNow(),
});

// Daily Activity - Track daily engagement for streak calculations
export const daily_activity = pgTable('daily_activity', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(),
  activity_date: date('activity_date').notNull(),
  points_earned: integer('points_earned').default(0),
  lessons_completed: integer('lessons_completed').default(0),
  quizzes_completed: integer('quizzes_completed').default(0),
  vocabulary_practiced: integer('vocabulary_practiced').default(0),
  games_played: integer('games_played').default(0),
  time_spent_minutes: integer('time_spent_minutes').default(0),
  languages_practiced: json('languages_practiced'), // Array of languages used
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique_student_date: unique().on(table.student_id, table.activity_date),
}));

// Completed Activities - Track to prevent duplicate point awarding
export const completed_activities = pgTable('completed_activities', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(),
  activity_type: varchar('activity_type', { length: 50 }).notNull(), // 'quiz', 'lesson', 'vocabulary', 'game'
  reference_id: integer('reference_id').notNull(), // ID of the specific quiz/lesson/etc
  first_completed_at: timestamp('first_completed_at').defaultNow(),
  completion_count: integer('completion_count').default(1),
  best_score: decimal('best_score', { precision: 5, scale: 2 }), // For tracking improvements
  latest_score: decimal('latest_score', { precision: 5, scale: 2 }),
  points_awarded: integer('points_awarded').default(0), // Total points awarded for this activity
  metadata: json('metadata'), // Store completion details
}, (table) => ({
  unique_student_activity: unique().on(table.student_id, table.activity_type, table.reference_id),
}));

// Media Files
export const media_files = pgTable('media_files', {
  id: serial('id').primaryKey(),
  blob_id: varchar('blob_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  size: integer('size').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }),
  tags: json('tags'),
  uploaded_by: integer('uploaded_by').notNull().references(() => users.id),
  uploaded_at: timestamp('uploaded_at').defaultNow(),
  metadata: json('metadata'), // Store additional file info
}, (table) => ({
  uploaded_by_idx: index('media_files_uploaded_by_idx').on(table.uploaded_by),
  category_idx: index('media_files_category_idx').on(table.category),
}));

// Class Analytics
export const class_analytics = pgTable('class_analytics', {
  id: serial('id').primaryKey(),
  class_id: integer('class_id').notNull(),
  date: date('date').notNull(),
  total_students: integer('total_students').default(0),
  active_students: integer('active_students').default(0),
  lessons_completed: integer('lessons_completed').default(0),
  quizzes_taken: integer('quizzes_taken').default(0),
  average_score: decimal('average_score', { precision: 5, scale: 2 }),
  total_time_minutes: integer('total_time_minutes').default(0),
  created_at: timestamp('created_at').defaultNow(),
});

// Parent Progress Reports
export const parent_reports = pgTable('parent_reports', {
  id: serial('id').primaryKey(),
  parent_id: integer('parent_id').notNull(),
  child_id: integer('child_id').notNull(),
  report_period: varchar('report_period', { length: 20 }).default('weekly'), // weekly, monthly
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  lessons_completed: integer('lessons_completed').default(0),
  quizzes_passed: integer('quizzes_passed').default(0),
  time_spent_minutes: integer('time_spent_minutes').default(0),
  current_level: varchar('current_level', { length: 50 }),
  points_earned: integer('points_earned').default(0),
  achievements_unlocked: integer('achievements_unlocked').default(0),
  report_data: json('report_data'), // Detailed breakdown
  generated_at: timestamp('generated_at').defaultNow(),
});

// Relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, {
    fields: [courses.created_by],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [courses.institution_id],
    references: [institutions.id],
  }),
  lessons: many(lessons),
  studentProgress: many(student_progress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.course_id],
    references: [courses.id],
  }),
  prerequisite: one(lessons, {
    fields: [lessons.prerequisite_lesson_id],
    references: [lessons.id],
  }),
  topics: many(topics),
  quizzes: many(quizzes),
  vocabulary: many(vocabulary),
  culturalContent: many(cultural_content),
  studentProgress: many(student_progress),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [topics.lesson_id],
    references: [lessons.id],
  }),
  quizzes: many(quizzes),
  vocabulary: many(vocabulary),
  studentProgress: many(student_progress),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [quizzes.lesson_id],
    references: [lessons.id],
  }),
  topic: one(topics, {
    fields: [quizzes.topic_id],
    references: [topics.id],
  }),
  questions: many(quiz_questions),
  studentProgress: many(student_progress),
}));

export const quiz_questionsRelations = relations(quiz_questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quiz_questions.quiz_id],
    references: [quizzes.id],
  }),
}));

export const student_progressRelations = relations(student_progress, ({ one }) => ({
  student: one(users, {
    fields: [student_progress.student_id],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [student_progress.course_id],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [student_progress.lesson_id],
    references: [lessons.id],
  }),
  topic: one(topics, {
    fields: [student_progress.topic_id],
    references: [topics.id],
  }),
  quiz: one(quizzes, {
    fields: [student_progress.quiz_id],
    references: [quizzes.id],
  }),
}));

export const vocabularyRelations = relations(vocabulary, ({ one }) => ({
  lesson: one(lessons, {
    fields: [vocabulary.lesson_id],
    references: [lessons.id],
  }),
  topic: one(topics, {
    fields: [vocabulary.topic_id],
    references: [topics.id],
  }),
}));

export const cultural_contentRelations = relations(cultural_content, ({ one }) => ({
  lesson: one(lessons, {
    fields: [cultural_content.lesson_id],
    references: [lessons.id],
  }),
}));

export const gamesRelations = relations(games, ({ one }) => ({
  addedBy: one(users, {
    fields: [games.added_by],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [games.lesson_id],
    references: [lessons.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  student: one(users, {
    fields: [achievements.student_id],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [achievements.course_id],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [achievements.lesson_id],
    references: [lessons.id],
  }),
}));

export const learning_streaksRelations = relations(learning_streaks, ({ one }) => ({
  student: one(users, {
    fields: [learning_streaks.student_id],
    references: [users.id],
  }),
}));

export const class_analyticsRelations = relations(class_analytics, ({ one }) => ({
  class: one(classes, {
    fields: [class_analytics.class_id],
    references: [classes.id],
  }),
}));

export const parent_reportsRelations = relations(parent_reports, ({ one }) => ({
  parent: one(users, {
    fields: [parent_reports.parent_id],
    references: [users.id],
  }),
  child: one(users, {
    fields: [parent_reports.child_id],
    references: [users.id],
  }),
}));

export const media_filesRelations = relations(media_files, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [media_files.uploaded_by],
    references: [users.id],
  }),
}));

// Type exports for content management
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type QuizQuestion = typeof quiz_questions.$inferSelect;
export type NewQuizQuestion = typeof quiz_questions.$inferInsert;
export type StudentProgress = typeof student_progress.$inferSelect;
export type NewStudentProgress = typeof student_progress.$inferInsert;
export type Vocabulary = typeof vocabulary.$inferSelect;
export type NewVocabulary = typeof vocabulary.$inferInsert;
export type CulturalContent = typeof cultural_content.$inferSelect;
export type NewCulturalContent = typeof cultural_content.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type LearningStreak = typeof learning_streaks.$inferSelect;
export type NewLearningStreak = typeof learning_streaks.$inferInsert;
export type PointTransaction = typeof point_transactions.$inferSelect;
export type NewPointTransaction = typeof point_transactions.$inferInsert;
export type DailyActivity = typeof daily_activity.$inferSelect;
export type NewDailyActivity = typeof daily_activity.$inferInsert;
export type CompletedActivity = typeof completed_activities.$inferSelect;
export type NewCompletedActivity = typeof completed_activities.$inferInsert;
export type MediaFile = typeof media_files.$inferSelect;
export type NewMediaFile = typeof media_files.$inferInsert;

 