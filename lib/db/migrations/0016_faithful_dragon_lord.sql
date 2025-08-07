ALTER TYPE "public"."game_type" ADD VALUE 'word_association' BEFORE 'custom';--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "content_audio_blob_id" varchar(255);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "content_audio_url" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "content_audio_generated_at" timestamp;