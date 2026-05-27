BEGIN;

CREATE TABLE IF NOT EXISTS "personalExterno" (
    anexo4_id BIGINT NOT NULL,
    indice INTEGER NOT NULL,
    nombre_apellidos VARCHAR(255),
    rol VARCHAR(255)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'personal_externo_pkey'
    ) THEN
        ALTER TABLE "personalExterno"
            ADD CONSTRAINT personal_externo_pkey PRIMARY KEY (anexo4_id, indice);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_personal_externo_anexo4'
    ) THEN
        ALTER TABLE "personalExterno"
            ADD CONSTRAINT fk_personal_externo_anexo4
            FOREIGN KEY (anexo4_id) REFERENCES anexo4(id) ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;
