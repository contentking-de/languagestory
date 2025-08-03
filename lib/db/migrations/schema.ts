import { pgTable, foreignKey, serial, integer, text, timestamp, varchar, unique, boolean, numeric, json, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const achievementType = pgEnum("achievement_type", ['story_completed', 'quiz_master', 'streak_7_days', 'streak_30_days', 'perfect_score', 'fast_learner', 'culture_expert', 'vocabulary_champion', 'streak_100_days', 'first_quiz', 'quiz_perfectionist', 'lesson_completed', 'course_completed', 'points_milestone_100', 'points_milestone_500', 'points_milestone_1000', 'points_milestone_5000', 'daily_learner', 'weekly_warrior', 'monthly_master', 'vocabulary_collector', 'game_champion', 'pronunciation_pro', 'grammar_guru', 'speaking_star'])
export const cultureType = pgEnum("culture_type", ['food', 'festival', 'tradition', 'geography', 'history', 'art', 'music'])
export const gameCategory = pgEnum("game_category", ['french', 'german', 'spanish', 'english', 'math', 'science', 'history', 'geography', 'vocabulary', 'grammar', 'general', 'quiz', 'matching', 'other'])
export const institutionType = pgEnum("institution_type", ['school', 'university', 'language_center', 'private_tutor', 'corporate'])
export const language = pgEnum("language", ['french', 'german', 'spanish', 'all'])
export const lessonType = pgEnum("lesson_type", ['story', 'game', 'vocabulary', 'grammar', 'culture', 'assessment'])
export const level = pgEnum("level", ['beginner', 'intermediate', 'advanced'])
export const progressStatus = pgEnum("progress_status", ['not_started', 'in_progress', 'completed', 'mastered'])
export const questionType = pgEnum("question_type", ['multiple_choice', 'true_false', 'fill_blank', 'matching', 'ordering', 'short_answer'])
export const quizType = pgEnum("quiz_type", ['multiple_choice', 'gap_fill', 'true_false', 'comprehension', 'vocabulary', 'grammar', 'listening', 'speaking', 'writing'])
export const subscriptionType = pgEnum("subscription_type", ['individual', 'institution', 'family'])
export const topicType = pgEnum("topic_type", ['story_page', 'comprehension_quiz', 'listening_gap_fill', 'vocabulary_game', 'anagram', 'matching_pairs', 'find_the_match', 'cultural_note', 'grammar_exercise', 'audio_exercise', 'video_content', 'interactive_game'])
export const userRole = pgEnum("user_role", ['super_admin', 'institution_admin', 'teacher', 'student', 'parent', 'content_creator', 'member'])


export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	teamId: integer("team_id").notNull(),
	userId: integer("user_id"),
	action: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	language: language(),
	metadata: text(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "activity_logs_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activity_logs_user_id_users_id_fk"
		}),
]);

export const invitations = pgTable("invitations", {
	id: serial().primaryKey().notNull(),
	teamId: integer("team_id").notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: userRole().notNull(),
	invitedBy: integer("invited_by").notNull(),
	invitedAt: timestamp("invited_at", { mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	language: language().default('all'),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "invitations_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [users.id],
			name: "invitations_invited_by_users_id_fk"
		}),
]);

export const teamMembers = pgTable("team_members", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	teamId: integer("team_id").notNull(),
	role: userRole().notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
	language: language().default('all'),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "team_members_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_members_team_id_teams_id_fk"
		}),
]);

export const teams = pgTable("teams", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	stripeProductId: text("stripe_product_id"),
	planName: varchar("plan_name", { length: 50 }),
	subscriptionStatus: varchar("subscription_status", { length: 20 }),
	subscriptionType: subscriptionType("subscription_type").default('individual').notNull(),
	institutionId: integer("institution_id"),
}, (table) => [
	foreignKey({
			columns: [table.institutionId],
			foreignColumns: [institutions.id],
			name: "teams_institution_id_institutions_id_fk"
		}),
	unique("teams_stripe_customer_id_unique").on(table.stripeCustomerId),
	unique("teams_stripe_subscription_id_unique").on(table.stripeSubscriptionId),
]);

export const vocabulary = pgTable("vocabulary", {
	id: serial().primaryKey().notNull(),
	wordFrench: varchar("word_french", { length: 100 }),
	wordGerman: varchar("word_german", { length: 100 }),
	wordSpanish: varchar("word_spanish", { length: 100 }),
	wordEnglish: varchar("word_english", { length: 100 }).notNull(),
	pronunciation: varchar({ length: 200 }),
	phonetic: varchar({ length: 200 }),
	audioFile: varchar("audio_file", { length: 255 }),
	imageFile: varchar("image_file", { length: 255 }),
	contextSentence: text("context_sentence"),
	culturalNote: text("cultural_note"),
	difficultyLevel: integer("difficulty_level").default(1),
	wordType: varchar("word_type", { length: 50 }),
	lessonId: integer("lesson_id"),
	topicId: integer("topic_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const classEnrollments = pgTable("class_enrollments", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	classId: integer("class_id").notNull(),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "class_enrollments_student_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "class_enrollments_class_id_classes_id_fk"
		}),
]);

export const classes = pgTable("classes", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	language: language().notNull(),
	teacherId: integer("teacher_id").notNull(),
	institutionId: integer("institution_id"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "classes_teacher_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.institutionId],
			foreignColumns: [institutions.id],
			name: "classes_institution_id_institutions_id_fk"
		}),
]);

export const institutions = pgTable("institutions", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	type: institutionType().notNull(),
	address: text(),
	contactEmail: varchar("contact_email", { length: 255 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const teachingAssignments = pgTable("teaching_assignments", {
	id: serial().primaryKey().notNull(),
	teacherId: integer("teacher_id").notNull(),
	language: language().notNull(),
	institutionId: integer("institution_id"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "teaching_assignments_teacher_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.institutionId],
			foreignColumns: [institutions.id],
			name: "teaching_assignments_institution_id_institutions_id_fk"
		}),
]);

export const studentProgress = pgTable("student_progress", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	courseId: integer("course_id"),
	lessonId: integer("lesson_id"),
	topicId: integer("topic_id"),
	quizId: integer("quiz_id"),
	status: progressStatus().default('not_started'),
	score: numeric({ precision: 5, scale:  2 }),
	timeSpent: integer("time_spent").default(0),
	attempts: integer().default(0),
	bestScore: numeric("best_score", { precision: 5, scale:  2 }),
	pointsEarned: integer("points_earned").default(0),
	lastAccessed: timestamp("last_accessed", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const topics = pgTable("topics", {
	id: serial().primaryKey().notNull(),
	lessonId: integer("lesson_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	content: text(),
	topicType: topicType("topic_type").notNull(),
	topicOrder: integer("topic_order").default(0),
	audioFile: varchar("audio_file", { length: 255 }),
	videoFile: varchar("video_file", { length: 255 }),
	difficultyLevel: integer("difficulty_level").default(1),
	pointsValue: integer("points_value").default(10),
	timeLimit: integer("time_limit"),
	isPublished: boolean("is_published").default(false),
	interactiveData: json("interactive_data"),
	wpTopicId: integer("wp_topic_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	role: userRole().default('student').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	preferredLanguage: language("preferred_language").default('all'),
	institutionId: integer("institution_id"),
	parentId: integer("parent_id"),
	isActive: boolean("is_active").default(true).notNull(),
	class: varchar({ length: 50 }),
	yearGroup: varchar("year_group", { length: 20 }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const games = pgTable("games", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	originalUrl: varchar("original_url", { length: 500 }).notNull(),
	normalizedUrl: varchar("normalized_url", { length: 500 }).notNull(),
	embedHtml: text("embed_html").notNull(),
	thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
	authorName: varchar("author_name", { length: 200 }),
	authorUrl: varchar("author_url", { length: 500 }),
	providerName: varchar("provider_name", { length: 100 }).default('Wordwall'),
	providerUrl: varchar("provider_url", { length: 500 }).default('https://wordwall.net'),
	width: integer(),
	height: integer(),
	category: gameCategory().default('general'),
	language: varchar({ length: 20 }),
	difficultyLevel: integer("difficulty_level").default(1),
	estimatedDuration: integer("estimated_duration"),
	tags: json(),
	isActive: boolean("is_active").default(true),
	isFeatured: boolean("is_featured").default(false),
	addedBy: integer("added_by").notNull(),
	usageCount: integer("usage_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	lessonId: integer("lesson_id"),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	used: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_users_id_fk"
		}),
	unique("password_reset_tokens_token_unique").on(table.token),
]);

export const achievements = pgTable("achievements", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	achievementType: achievementType("achievement_type").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	language: varchar({ length: 20 }),
	badgeIcon: varchar("badge_icon", { length: 255 }),
	pointsEarned: integer("points_earned").default(0),
	earnedAt: timestamp("earned_at", { mode: 'string' }).defaultNow(),
	courseId: integer("course_id"),
	lessonId: integer("lesson_id"),
});

export const classAnalytics = pgTable("class_analytics", {
	id: serial().primaryKey().notNull(),
	classId: integer("class_id").notNull(),
	date: date().notNull(),
	totalStudents: integer("total_students").default(0),
	activeStudents: integer("active_students").default(0),
	lessonsCompleted: integer("lessons_completed").default(0),
	quizzesTaken: integer("quizzes_taken").default(0),
	averageScore: numeric("average_score", { precision: 5, scale:  2 }),
	totalTimeMinutes: integer("total_time_minutes").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const courses = pgTable("courses", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	description: text(),
	language: varchar({ length: 20 }).notNull(),
	level: level().default('beginner'),
	institutionId: integer("institution_id"),
	createdBy: integer("created_by").notNull(),
	isPublished: boolean("is_published").default(false),
	courseOrder: integer("course_order").default(0),
	estimatedDuration: integer("estimated_duration"),
	totalLessons: integer("total_lessons").default(0),
	totalPoints: integer("total_points").default(0),
	coverImage: varchar("cover_image", { length: 255 }),
	wpCourseId: integer("wp_course_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("courses_slug_unique").on(table.slug),
]);

export const culturalContent = pgTable("cultural_content", {
	id: serial().primaryKey().notNull(),
	lessonId: integer("lesson_id"),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	content: text(),
	cultureType: cultureType("culture_type").notNull(),
	language: varchar({ length: 20 }).notNull(),
	country: varchar({ length: 100 }),
	region: varchar({ length: 100 }),
	imageUrl: varchar("image_url", { length: 255 }),
	videoUrl: varchar("video_url", { length: 255 }),
	audioUrl: varchar("audio_url", { length: 255 }),
	externalLinks: json("external_links"),
	isPublished: boolean("is_published").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const learningStreaks = pgTable("learning_streaks", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	currentStreak: integer("current_streak").default(0),
	longestStreak: integer("longest_streak").default(0),
	lastActivityDate: date("last_activity_date"),
	totalPoints: integer("total_points").default(0),
	totalLessons: integer("total_lessons").default(0),
	totalTimeMinutes: integer("total_time_minutes").default(0),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("learning_streaks_student_id_unique").on(table.studentId),
]);

export const lessons = pgTable("lessons", {
	id: serial().primaryKey().notNull(),
	courseId: integer("course_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	description: text(),
	content: text(),
	lessonType: lessonType("lesson_type").default('story'),
	lessonOrder: integer("lesson_order").default(0),
	estimatedDuration: integer("estimated_duration"),
	pointsValue: integer("points_value").default(50),
	isPublished: boolean("is_published").default(false),
	prerequisiteLessonId: integer("prerequisite_lesson_id"),
	coverImage: varchar("cover_image", { length: 255 }),
	audioFile: varchar("audio_file", { length: 255 }),
	videoFile: varchar("video_file", { length: 255 }),
	wpLessonId: integer("wp_lesson_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const parentReports = pgTable("parent_reports", {
	id: serial().primaryKey().notNull(),
	parentId: integer("parent_id").notNull(),
	childId: integer("child_id").notNull(),
	reportPeriod: varchar("report_period", { length: 20 }).default('weekly'),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	lessonsCompleted: integer("lessons_completed").default(0),
	quizzesPassed: integer("quizzes_passed").default(0),
	timeSpentMinutes: integer("time_spent_minutes").default(0),
	currentLevel: varchar("current_level", { length: 50 }),
	pointsEarned: integer("points_earned").default(0),
	achievementsUnlocked: integer("achievements_unlocked").default(0),
	reportData: json("report_data"),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
	id: serial().primaryKey().notNull(),
	quizId: integer("quiz_id").notNull(),
	questionText: text("question_text").notNull(),
	questionType: questionType("question_type").notNull(),
	correctAnswer: text("correct_answer"),
	answerOptions: json("answer_options"),
	explanation: text(),
	points: integer().default(1),
	questionOrder: integer("question_order").default(0),
	audioFile: varchar("audio_file", { length: 255 }),
	imageFile: varchar("image_file", { length: 255 }),
	wpQuestionId: integer("wp_question_id"),
});

export const quizzes = pgTable("quizzes", {
	id: serial().primaryKey().notNull(),
	lessonId: integer("lesson_id"),
	topicId: integer("topic_id"),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	quizType: quizType("quiz_type").default('comprehension'),
	passPercentage: integer("pass_percentage").default(70),
	timeLimit: integer("time_limit"),
	maxAttempts: integer("max_attempts").default(3),
	pointsValue: integer("points_value").default(25),
	isPublished: boolean("is_published").default(false),
	wpQuizId: integer("wp_quiz_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const pointTransactions = pgTable("point_transactions", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	activityType: varchar("activity_type", { length: 50 }).notNull(),
	pointsChange: integer("points_change").notNull(),
	description: varchar({ length: 255 }).notNull(),
	referenceId: integer("reference_id"),
	referenceType: varchar("reference_type", { length: 50 }),
	language: varchar({ length: 20 }),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const dailyActivity = pgTable("daily_activity", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	activityDate: date("activity_date").notNull(),
	pointsEarned: integer("points_earned").default(0),
	lessonsCompleted: integer("lessons_completed").default(0),
	quizzesCompleted: integer("quizzes_completed").default(0),
	vocabularyPracticed: integer("vocabulary_practiced").default(0),
	gamesPlayed: integer("games_played").default(0),
	timeSpentMinutes: integer("time_spent_minutes").default(0),
	languagesPracticed: json("languages_practiced"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("daily_activity_student_id_activity_date_unique").on(table.studentId, table.activityDate),
]);
