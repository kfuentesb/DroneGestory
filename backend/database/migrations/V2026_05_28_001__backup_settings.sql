CREATE TABLE IF NOT EXISTS backup_settings (
    backup_settings_id INTEGER PRIMARY KEY,
    schedule_day INTEGER NOT NULL DEFAULT 1,
    schedule_hour INTEGER NOT NULL DEFAULT 2,
    last_run_date DATE,
    last_backup_path VARCHAR(1024)
);

INSERT INTO backup_settings (backup_settings_id, schedule_day, schedule_hour)
VALUES (1, 1, 2)
ON CONFLICT (backup_settings_id) DO NOTHING;
