ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "class" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "year_group" varchar(20);