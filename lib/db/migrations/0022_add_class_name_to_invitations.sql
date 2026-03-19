-- Add class_name to invitations table
ALTER TABLE "invitations" ADD COLUMN "class_name" varchar(100);

-- Create team_class_names table for storing reusable class names per team
CREATE TABLE IF NOT EXISTS "team_class_names" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "name" varchar(100) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "team_class_names_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
