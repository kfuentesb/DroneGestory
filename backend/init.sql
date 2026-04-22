INSERT INTO app_user (
    first_name,
    last_name,
    username,
    password_hash,
    email,
    phone_number,
    doc_identidad,
    fecha_nac,
    state
) VALUES (
             'ADMIN',
             'ADMIN',
             'admin',
             '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS',
             'admin@admin.es',
             600111333,
             '00000000T',
             '1990-01-01',
             true
         );

-- Asignar rol ADMIN
INSERT INTO app_user_roles (user_id, role)
SELECT user_id, 'ADMIN'
FROM app_user
WHERE username = 'admin';
