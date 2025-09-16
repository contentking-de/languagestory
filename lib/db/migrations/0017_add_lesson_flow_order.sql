-- Add flow_order JSON column to lessons to persist lesson flow ordering
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS flow_order json;

