CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"blob_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"size" integer NOT NULL,
	"type" varchar(100) NOT NULL,
	"category" varchar(50),
	"tags" json,
	"uploaded_by" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"metadata" json,
	CONSTRAINT "media_files_blob_id_unique" UNIQUE("blob_id")
);
--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_files_uploaded_by_idx" ON "media_files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "media_files_category_idx" ON "media_files" USING btree ("category");