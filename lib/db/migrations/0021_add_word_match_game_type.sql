DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'game_type' AND e.enumlabel = 'word_match'
  ) THEN
    ALTER TYPE game_type ADD VALUE 'word_match';
  END IF;
END$$;
