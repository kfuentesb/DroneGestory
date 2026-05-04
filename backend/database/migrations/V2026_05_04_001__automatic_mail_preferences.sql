CREATE TABLE IF NOT EXISTS automatic_mail_preference (
    automatic_mail_preference_id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    certificates_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    operations_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    events_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_automatic_mail_preference_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(user_id)
        ON DELETE CASCADE
);
