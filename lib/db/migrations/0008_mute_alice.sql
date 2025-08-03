-- Skipping enum changes temporarily to avoid conflicts
CREATE TABLE IF NOT EXISTS "daily_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"activity_date" date NOT NULL,
	"points_earned" integer DEFAULT 0,
	"lessons_completed" integer DEFAULT 0,
	"quizzes_completed" integer DEFAULT 0,
	"vocabulary_practiced" integer DEFAULT 0,
	"games_played" integer DEFAULT 0,
	"time_spent_minutes" integer DEFAULT 0,
	"languages_practiced" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_activity_student_id_activity_date_unique" UNIQUE("student_id","activity_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "point_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"points_change" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"reference_id" integer,
	"reference_type" varchar(50),
	"language" varchar(20),
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
