BEGIN;

CREATE TABLE IF NOT EXISTS operation_assigned_users (
    operation_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'operation_assigned_users_pkey'
    ) THEN
        ALTER TABLE operation_assigned_users
            ADD CONSTRAINT operation_assigned_users_pkey PRIMARY KEY (operation_id, user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_operation_assigned_users_operation'
    ) THEN
        ALTER TABLE operation_assigned_users
            ADD CONSTRAINT fk_operation_assigned_users_operation
            FOREIGN KEY (operation_id) REFERENCES operation(id_operacion) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_operation_assigned_users_user'
    ) THEN
        ALTER TABLE operation_assigned_users
            ADD CONSTRAINT fk_operation_assigned_users_user
            FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;
