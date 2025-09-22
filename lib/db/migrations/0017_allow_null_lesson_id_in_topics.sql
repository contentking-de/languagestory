-- Allow NULL for lesson_id in topics so grammar exercises can be unassigned
ALTER TABLE "topics" ALTER COLUMN "lesson_id" DROP NOT NULL;

