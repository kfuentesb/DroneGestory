INSERT INTO app_user
(type, first_name, last_name, username, password_hash, email, phone_number, image_path)
VALUES
('ADMIN', 'Carlos', 'Martinez Lopez', 'cmartinez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'carlos@skydron.es', 600111333, 'human-1.jpg'),
('MANAGER', 'Lucia', 'Fernandez Ruiz', 'lfernandez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'lucia@skydron.es', 600111444, 'human-2.jpg'),
('PILOT', 'Miguel', 'Santos Perez', 'msantos', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'miguel@aerovision.es', 600333555, 'human-3.jpg'),
('PILOT', 'Dani', 'Marquez Romero', 'dmarquez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'dani@aerovision.es', 600444666, 'human-4.jpg'),
('PILOT', 'Juan', 'Sánchez Blanco', 'jsanchez', '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS', 'juan@aerovision.es', 600555777, 'human-5.jpg');


-- La contraseña está hasheada de "pass123"--

INSERT INTO aircraft (
    aircraft_id, accessories, class, applicant_name, applicant_type, cable_lenght, camera, image_path, impact_energy,
    manufacturer_name, max_autonomy, max_speed, model, mtom, observations, operador_name, operator_number,
    power_source, power_source_type, privately_built, purchase_date, serial_number, tether, type, wingspan
) VALUES (
    1001, 'Paracaídas; Faro LED', 'C2', 'DroneCorp', 'Operator', 35.700, true, 'img/drones/drone1.png', 410.325,
    NULL, 90, 120.500, 'Falcon One', 7.120, 'Operativo en área urbana', 'Equipos Remotos SL', 30255,
    'Electric', 'Hydrogen', false, '2025-07-16', 987654, false, 'Multirrotor', 1.780
),(
    1002, 'Batería de repuesto', 'NO', 'AeroMaker', 'Manufacturer', NULL, false, NULL, 85.000,
    'AeroMaker Industries', 45, 60.300, 'Glider X', 2.050, 'Prototipo para pruebas', NULL, NULL,
    'Non_Electric', 'Gasoline', true, '2026-01-05', 764321, true, 'Avion', 2.950
);