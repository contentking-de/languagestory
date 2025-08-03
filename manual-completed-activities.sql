-- Create completed_activities table to prevent duplicate point awarding
CREATE TABLE IF NOT EXISTS "completed_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"reference_id" integer NOT NULL,
	"first_completed_at" timestamp DEFAULT now(),
	"completion_count" integer DEFAULT 1,
	"best_score" numeric(5,2),
	"latest_score" numeric(5,2),
	"points_awarded" integer DEFAULT 0,
	"metadata" json
);

-- Add unique constraint to prevent duplicate tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'completed_activities_student_id_activity_type_reference_id_unique'
    ) THEN
        ALTER TABLE "completed_activities" ADD CONSTRAINT "completed_activities_student_id_activity_type_reference_id_unique" UNIQUE("student_id","activity_type","reference_id");
    END IF;
END
$$;