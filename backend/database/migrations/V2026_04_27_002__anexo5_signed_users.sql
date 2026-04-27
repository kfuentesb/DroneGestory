CREATE TABLE IF NOT EXISTS anexo5_signed_users (
    anexo5_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (anexo5_id, user_id),
    CONSTRAINT fk_anexo5_signed_users_anexo5
        FOREIGN KEY (anexo5_id) REFERENCES anexo5(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_anexo5_signed_users_user
        FOREIGN KEY (user_id) REFERENCES app_user(user_id)
        ON DELETE CASCADE
);
