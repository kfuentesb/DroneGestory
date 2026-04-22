BEGIN;

CREATE TABLE IF NOT EXISTS app_user_roles (
    user_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL
);

INSERT INTO app_user_roles (user_id, role)
SELECT u.user_id, u.type::varchar
FROM app_user u
WHERE u.type IS NOT NULL
ON CONFLICT DO NOTHING;

DELETE FROM app_user_roles a
USING app_user_roles b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id
  AND a.role = b.role;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'app_user_roles_pkey'
    ) THEN
        ALTER TABLE app_user_roles
            ADD CONSTRAINT app_user_roles_pkey PRIMARY KEY (user_id, role);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_app_user_roles_user'
    ) THEN
        ALTER TABLE app_user_roles
            ADD CONSTRAINT fk_app_user_roles_user
            FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'app_user_roles_role_check'
    ) THEN
        ALTER TABLE app_user_roles DROP CONSTRAINT app_user_roles_role_check;
    END IF;
END $$;

ALTER TABLE app_user_roles
    ADD CONSTRAINT app_user_roles_role_check
    CHECK (role IN ('ADMIN', 'MANAGER', 'MAINTAINER', 'PILOT'));

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'app_user'
          AND column_name = 'type'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'app_user_type_check'
        ) THEN
            ALTER TABLE app_user DROP CONSTRAINT app_user_type_check;
        END IF;

        ALTER TABLE app_user DROP COLUMN type;
    END IF;
END $$;

COMMIT;
