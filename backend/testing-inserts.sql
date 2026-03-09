INSERT INTO operator
(name, fiscal_id, operator_number, secret_code_rid, easa_certificate_path, non_easa_certificate_path, address, postal_code, city, province, email, phone_number)
VALUES
    ('DroneTools', 12345678, 1001, 999111, '/docs/easa_sky.pdf', '/docs/no_easa_sky.pdf', 'Calle Aerea 123', 28001, 'Seville', 'Seville', 'info@dronetools.es', 600111222);

INSERT INTO app_user
(operator_id, first_name, last_name, username, password, email, phone_number, image_path)
VALUES
    (1, 'Carlos', 'Martinez Lopez', 'cmartinez', '$2a$10$uHkHqf3JjKj1LkZcJ6b0Eu0dR8D84G4tHJ3x/5Z9tTq0v6rHfGh1G', 'carlos@skydron.es', 600111333, '/img/carlos.jpg'),
    (1, 'Lucia', 'Fernandez Ruiz', 'lfernandez', '$2a$10$uHkHqf3JjKj1LkZcJ6b0Eu0dR8D84G4tHJ3x/5Z9tTq0v6rHfGh1G', 'lucia@skydron.es', 600111444, '/img/lucia.jpg'),
    (1, 'Miguel', 'Santos Perez', 'msantos', '$2a$10$uHkHqf3JjKj1LkZcJ6b0Eu0dR8D84G4tHJ3x/5Z9tTq0v6rHfGh1G', 'miguel@aerovision.es', 600333555, '/img/miguel.jpg');

INSERT INTO pilot (operator_id, user_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 3);

INSERT INTO certification (name, type)
VALUES
    ('EASA A1/A3', 'European'),
    ('EASA A2', 'European'),
    ('STS-01', 'Specific'),
    ('BVLOS', 'Advanced');

INSERT INTO pilot_license
(pilot_id, certification_id, start_date, expiry_date)
VALUES
    (1, 1, '2023-01-10', '2028-01-10'),
    (1, 4, '2024-02-01', '2026-02-01'),
    (2, 1, '2022-05-15', '2027-05-15'),
    (2, 2, '2023-03-20', '2028-03-20'),
    (3, 3, '2024-01-01', '2026-01-01');

INSERT INTO insurance
(name, start_date, expiry_date, amount)
VALUES
    ('Mapfre Drones', '2024-01-01', '2025-01-01', 500000),
    ('Allianz UAV', '2024-06-01', '2025-06-01', 750000);

INSERT INTO aircraft
(operator_id, insurance_id, name, serial_number, status, manufacturer, model, image_path, purchase_date)
VALUES
    (1, 1, 'SkyOne', 111001, 'Active', 'DJI', 'Mavic 3', '/img/mavic3.jpg', '2023-06-10'),
    (1, 1, 'SkyPro', 111002, 'Maintenance', 'DJI', 'Inspire 2', '/img/inspire2.jpg', '2022-04-15'),
    (1, 2, 'AeroX', 222001, 'Active', 'Autel', 'Evo II', '/img/evo2.jpg', '2023-09-01');

INSERT INTO operation
(pilot_id, aircraft_id, execution_date, status, category)
VALUES
    (1, 1, '2024-10-01', 'Completed', 'Inspection'),
    (1, 1, '2024-11-12', 'Completed', 'Photogrammetry'),
    (2, 2, '2024-12-05', 'Cancelled', 'Audiovisual'),
    (3, 3, '2025-01-15', 'Completed', 'Agricultural');