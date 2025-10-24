DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'game_type' AND e.enumlabel = 'listen_type'
  ) THEN
    ALTER TYPE game_type ADD VALUE 'listen_type';
  END IF;
END$$;



