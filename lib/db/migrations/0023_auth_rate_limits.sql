CREATE TABLE IF NOT EXISTS "auth_rate_limits" (
  "bucket" varchar(128) PRIMARY KEY NOT NULL,
  "hits" integer NOT NULL,
  "window_start" timestamp DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION reject_abusive_signups()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  recent_signups integer;
BEGIN
  IF NEW.name ~* '(https?://|bit\.ly|www\.|t\.me|casino|bonus|viagra|porn|cialis|levitra|kamagra|seni bekliyor)' THEN
    RAISE EXCEPTION 'signup rejected';
  END IF;

  SELECT count(*) INTO recent_signups
  FROM users
  WHERE created_at > now() - interval '10 minutes';

  IF recent_signups >= 20 THEN
    RAISE EXCEPTION 'signup rate limit';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_signup_guard ON users;
CREATE TRIGGER users_signup_guard
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION reject_abusive_signups();
