ALTER TABLE "lessons" ADD COLUMN "cultural_audio_blob_id" varchar(255);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "cultural_audio_url" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "cultural_audio_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "vocabulary" ADD COLUMN "audio_blob_id" varchar(255);--> statement-breakpoint
ALTER TABLE "vocabulary" ADD COLUMN "audio_url" text;--> statement-breakpoint
ALTER TABLE "vocabulary" ADD COLUMN "audio_generated_at" timestamp;