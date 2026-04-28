BEGIN;

ALTER TABLE operation_assigned_users
    DROP CONSTRAINT IF EXISTS fk_operation_assigned_users_user;

DO $$
DECLARE
    fk_name text;
BEGIN
    SELECT c.conname
    INTO fk_name
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_class r ON c.confrelid = r.oid
    WHERE t.relname = 'operation_assigned_users'
      AND r.relname = 'app_user'
      AND c.contype = 'f';

    IF fk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE operation_assigned_users DROP CONSTRAINT %I', fk_name);
    END IF;
END $$;

ALTER TABLE operation_assigned_users
    ADD CONSTRAINT fk_operation_assigned_users_user
    FOREIGN KEY (user_id) REFERENCES app_user(user_id)
    ON DELETE CASCADE;

COMMIT;
