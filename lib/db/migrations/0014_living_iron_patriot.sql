CREATE TYPE "public"."game_type" AS ENUM('wordwall', 'memory', 'hangman', 'word_search', 'crossword', 'flashcards', 'fill_blank', 'multiple_choice', 'drag_drop', 'custom');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "original_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "normalized_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "embed_html" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "provider_name" SET DEFAULT 'Custom';--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "provider_url" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_type" "game_type" DEFAULT 'wordwall';--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_config" json;