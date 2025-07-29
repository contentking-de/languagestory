CREATE TYPE "public"."achievement_type" AS ENUM('story_completed', 'quiz_master', 'streak_7_days', 'streak_30_days', 'perfect_score', 'fast_learner', 'culture_expert', 'vocabulary_champion');--> statement-breakpoint
CREATE TYPE "public"."culture_type" AS ENUM('food', 'festival', 'tradition', 'geography', 'history', 'art', 'music');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('story', 'game', 'vocabulary', 'grammar', 'culture', 'assessment');--> statement-breakpoint
CREATE TYPE "public"."level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."progress_status" AS ENUM('not_started', 'in_progress', 'completed', 'mastered');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice', 'true_false', 'fill_blank', 'matching', 'ordering', 'short_answer');--> statement-breakpoint
CREATE TYPE "public"."quiz_type" AS ENUM('comprehension', 'vocabulary', 'grammar', 'listening', 'speaking', 'writing');--> statement-breakpoint
CREATE TYPE "public"."topic_type" AS ENUM('story_page', 'comprehension_quiz', 'listening_gap_fill', 'vocabulary_game', 'anagram', 'matching_pairs', 'find_the_match', 'cultural_note', 'grammar_exercise', 'audio_exercise', 'video_content', 'interactive_game');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"achievement_type" "achievement_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"language" varchar(20),
	"badge_icon" varchar(255),
	"points_earned" integer DEFAULT 0,
	"earned_at" timestamp DEFAULT now(),
	"course_id" integer,
	"lesson_id" integer
);
--> statement-breakpoint
CREATE TABLE "class_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer NOT NULL,
	"date" date NOT NULL,
	"total_students" integer DEFAULT 0,
	"active_students" integer DEFAULT 0,
	"lessons_completed" integer DEFAULT 0,
	"quizzes_taken" integer DEFAULT 0,
	"average_score" numeric(5, 2),
	"total_time_minutes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"language" varchar(20) NOT NULL,
	"level" "level" DEFAULT 'beginner',
	"institution_id" integer,
	"created_by" integer NOT NULL,
	"is_published" boolean DEFAULT false,
	"course_order" integer DEFAULT 0,
	"estimated_duration" integer,
	"total_lessons" integer DEFAULT 0,
	"total_points" integer DEFAULT 0,
	"cover_image" varchar(255),
	"wp_course_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cultural_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer,
	"title" varchar(200) NOT NULL,
	"description" text,
	"content" text,
	"culture_type" "culture_type" NOT NULL,
	"language" varchar(20) NOT NULL,
	"country" varchar(100),
	"region" varchar(100),
	"image_url" varchar(255),
	"video_url" varchar(255),
	"audio_url" varchar(255),
	"external_links" json,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" date,
	"total_points" integer DEFAULT 0,
	"total_lessons" integer DEFAULT 0,
	"total_time_minutes" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "learning_streaks_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"content" text,
	"lesson_type" "lesson_type" DEFAULT 'story',
	"lesson_order" integer DEFAULT 0,
	"estimated_duration" integer,
	"points_value" integer DEFAULT 50,
	"is_published" boolean DEFAULT false,
	"prerequisite_lesson_id" integer,
	"cover_image" varchar(255),
	"audio_file" varchar(255),
	"video_file" varchar(255),
	"wp_lesson_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"report_period" varchar(20) DEFAULT 'weekly',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"lessons_completed" integer DEFAULT 0,
	"quizzes_passed" integer DEFAULT 0,
	"time_spent_minutes" integer DEFAULT 0,
	"current_level" varchar(50),
	"points_earned" integer DEFAULT 0,
	"achievements_unlocked" integer DEFAULT 0,
	"report_data" json,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"correct_answer" text,
	"answer_options" json,
	"explanation" text,
	"points" integer DEFAULT 1,
	"question_order" integer DEFAULT 0,
	"audio_file" varchar(255),
	"image_file" varchar(255),
	"wp_question_id" integer
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer,
	"topic_id" integer,
	"title" varchar(200) NOT NULL,
	"description" text,
	"quiz_type" "quiz_type" DEFAULT 'comprehension',
	"pass_percentage" integer DEFAULT 70,
	"time_limit" integer,
	"max_attempts" integer DEFAULT 3,
	"points_value" integer DEFAULT 25,
	"is_published" boolean DEFAULT false,
	"wp_quiz_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"course_id" integer,
	"lesson_id" integer,
	"topic_id" integer,
	"quiz_id" integer,
	"status" "progress_status" DEFAULT 'not_started',
	"score" numeric(5, 2),
	"time_spent" integer DEFAULT 0,
	"attempts" integer DEFAULT 0,
	"best_score" numeric(5, 2),
	"points_earned" integer DEFAULT 0,
	"last_accessed" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"content" text,
	"topic_type" "topic_type" NOT NULL,
	"topic_order" integer DEFAULT 0,
	"audio_file" varchar(255),
	"video_file" varchar(255),
	"difficulty_level" integer DEFAULT 1,
	"points_value" integer DEFAULT 10,
	"time_limit" integer,
	"is_published" boolean DEFAULT false,
	"interactive_data" json,
	"wp_topic_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"word_french" varchar(100),
	"word_german" varchar(100),
	"word_spanish" varchar(100),
	"word_english" varchar(100) NOT NULL,
	"pronunciation" varchar(200),
	"phonetic" varchar(200),
	"audio_file" varchar(255),
	"image_file" varchar(255),
	"context_sentence" text,
	"cultural_note" text,
	"difficulty_level" integer DEFAULT 1,
	"word_type" varchar(50),
	"lesson_id" integer,
	"topic_id" integer,
	"created_at" timestamp DEFAULT now()
);
