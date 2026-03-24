INSERT INTO app_user
(type, first_name, last_name, username, password_hash, email, phone_number)
VALUES
('ADMIN', 'ADMIN', 'ADMIN', 'admin', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'admin@admin.es', 600111333),
('MANAGER', 'Lucia', 'Fernandez Ruiz', 'lfernandez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'lucia@skydron.es', 600111444),
('PILOT', 'Miguel', 'Santos Perez', 'msantos', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'miguel@aerovision.es', 600333555),
('PILOT', 'Dani', 'Marquez Romero', 'dmarquez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'dani@aerovision.es', 600444666),
('PILOT', 'Juan', 'Sánchez Blanco', 'jsanchez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'juan@aerovision.es', 600555777);


-- La contraseña está hasheada de "pass123"--

INSERT INTO aircraft (
    aircraft_id, manufacturer, model, serial_number, class, mtom, wingspan, max_speed, config, impact_energy, camera
) VALUES
(1001, 'DroneCorp', 'Falcon One', 987654, 'C2', 7.120, 1.780, 120.500, 'Multirrotor', 410.325, true),
(1002, 'AeroMaker Industries', 'Glider X', 764321, 'No', 2.050, 2.950, 60.300, 'Avion', 85.000, false);
