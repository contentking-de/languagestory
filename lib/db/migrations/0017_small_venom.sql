CREATE TYPE "public"."outreach_status" AS ENUM('pending', 'sent', 'failed', 'bounced');--> statement-breakpoint
CREATE TABLE "outreach_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(200),
	"company" varchar(200),
	"notes" text,
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"subject" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"status" "outreach_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"sent_by" integer NOT NULL,
	"resend_id" varchar(255),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_class_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "game_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "game_type" SET DEFAULT 'memory'::text;--> statement-breakpoint
DROP TYPE "public"."game_type";--> statement-breakpoint
CREATE TYPE "public"."game_type" AS ENUM('memory', 'hangman', 'word_search', 'crossword', 'flashcards', 'fill_blank', 'multiple_choice', 'drag_drop', 'word_mixup', 'word_association', 'custom', 'vocab_run', 'listen_type', 'word_match');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "game_type" SET DEFAULT 'memory'::"public"."game_type";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "game_type" SET DATA TYPE "public"."game_type" USING "game_type"::"public"."game_type";--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "lesson_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "class_name" varchar(100);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "flow_order" json;--> statement-breakpoint
ALTER TABLE "outreach_emails" ADD CONSTRAINT "outreach_emails_contact_id_outreach_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."outreach_contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_emails" ADD CONSTRAINT "outreach_emails_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_class_names" ADD CONSTRAINT "team_class_names_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;