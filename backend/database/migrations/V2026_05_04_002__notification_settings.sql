CREATE TABLE IF NOT EXISTS notification_settings (
    notification_settings_id INTEGER PRIMARY KEY,
    schedule_hour INTEGER NOT NULL DEFAULT 9,
    certificate_first_days_ahead INTEGER NOT NULL DEFAULT 30,
    certificate_second_days_ahead INTEGER NOT NULL DEFAULT 7,
    operation_days_ahead INTEGER NOT NULL DEFAULT 1,
    maintenance_days_ahead INTEGER NOT NULL DEFAULT 1,
    event_days_ahead INTEGER NOT NULL DEFAULT 1,
    last_run_date DATE,
    CONSTRAINT chk_notification_schedule_hour CHECK (schedule_hour BETWEEN 0 AND 23),
    CONSTRAINT chk_notification_certificate_first CHECK (certificate_first_days_ahead BETWEEN 0 AND 3650),
    CONSTRAINT chk_notification_certificate_second CHECK (certificate_second_days_ahead BETWEEN 0 AND 3650),
    CONSTRAINT chk_notification_operation_days CHECK (operation_days_ahead BETWEEN 0 AND 3650),
    CONSTRAINT chk_notification_maintenance_days CHECK (maintenance_days_ahead BETWEEN 0 AND 3650),
    CONSTRAINT chk_notification_event_days CHECK (event_days_ahead BETWEEN 0 AND 3650)
);

INSERT INTO notification_settings (
    notification_settings_id,
    schedule_hour,
    certificate_first_days_ahead,
    certificate_second_days_ahead,
    operation_days_ahead,
    maintenance_days_ahead,
    event_days_ahead
) VALUES (1, 9, 30, 7, 1, 1, 1)
ON CONFLICT (notification_settings_id) DO NOTHING;
