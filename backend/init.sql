INSERT INTO app_user 
(type, first_name, last_name, username, password_hash, email, phone_number, doc_identidad, fecha_nac, state)
VALUES 
('ADMIN', 'ADMIN', 'ADMIN', 'admin', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'admin@admin.es', '600111333', '00000000T', '1990-01-01', true),
('MANAGER', 'Lucia', 'Fernandez Ruiz', 'lfernandez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'lucia@skydron.es', '600111444', '12345678A', '1985-05-12', true),
('PILOT', 'Miguel', 'Santos Perez', 'msantos', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'miguel@aerovision.es', '600333555', '23456789B', '1992-08-20', true),
('PILOT', 'Dani', 'Marquez Romero', 'dmarquez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'dani@aerovision.es', '600444666', '34567890C', '1995-03-15', true),
('PILOT', 'Juan', 'Sánchez Blanco', 'jsanchez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'juan@aerovision.es', '600555777', '45678901D', NULL, true);

