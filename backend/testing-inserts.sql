INSERT INTO operadora
(nombre, id_fiscal, num_operadora, codigo_secreto_rid, path_certificado_easa, path_certificado_no_easa, direccion, cod_postal, poblacion, provincia, email, num_telefono)
VALUES
    ('DroneTools', 12345678, 1001, 999111, '/docs/easa_sky.pdf', '/docs/no_easa_sky.pdf', 'Calle Aerea 123', 28001, 'Sevilla', 'Sevilla', 'info@dronetools.es', 600111222);

INSERT INTO usuario
(id_operadora, nombre, apellidos, nombre_usuario, password, correo, num_telefono, path_imagen)
VALUES
    (1, 'Carlos', 'Martinez Lopez', 'cmartinez', '$2a$10$uHkHqf3JjKj1LkZcJ6b0Eu0dR8D84G4tHJ3x/5Z9tTq0v6rHfGh1G', 'carlos@skydron.es', 600111333, '/img/carlos.jpg'),
    (1, 'Lucia', 'Fernandez Ruiz', 'lfernandez', '$2a$10$uHkHqf3JjKj1LkZcJ6b0Eu0dR8D84G4tHJ3x/5Z9tTq0v6rHfGh1G', 'lucia@skydron.es', 600111444, '/img/lucia.jpg'),
    (1, 'Miguel', 'Santos Perez', 'msantos', '$2a$10$uHkHqf3JjKj1LkZcJ6b0Eu0dR8D84G4tHJ3x/5Z9tTq0v6rHfGh1G', 'miguel@aerovision.es', 600333555, '/img/miguel.jpg');

INSERT INTO piloto (id_operadora, id_usuario)
VALUES
    (1, 1),
    (1, 2),
    (1, 3);

INSERT INTO certificacion (nombre, tipo)
VALUES
    ('EASA A1/A3', 'Europea'),
    ('EASA A2', 'Europea'),
    ('STS-01', 'Especifica'),
    ('BVLOS', 'Avanzada');

INSERT INTO habilitacion_nm
(id_piloto, id_certificacion, fecha_alta, fecha_caducidad)
VALUES
    (1, 1, '2023-01-10', '2028-01-10'),
    (1, 4, '2024-02-01', '2026-02-01'),
    (2, 1, '2022-05-15', '2027-05-15'),
    (2, 2, '2023-03-20', '2028-03-20'),
    (3, 3, '2024-01-01', '2026-01-01');

INSERT INTO aseguradora
(nombre, fecha_comienzo, fecha_caducidad, importe)
VALUES
    ('Mapfre Drones', '2024-01-01', '2025-01-01', 500000),
    ('Allianz UAV', '2024-06-01', '2025-06-01', 750000);

INSERT INTO aeronave
(id_operadora, id_seguro, nombre, num_serie, estado, fabricante, modelo, path_imagen, fecha_compra)
VALUES
    (1, 1, 'SkyOne', 111001, 'Activa', 'DJI', 'Mavic 3', '/img/mavic3.jpg', '2023-06-10'),
    (1, 1, 'SkyPro', 111002, 'Mantenimiento', 'DJI', 'Inspire 2', '/img/inspire2.jpg', '2022-04-15'),
    (1, 2, 'AeroX', 222001, 'Activa', 'Autel', 'Evo II', '/img/evo2.jpg', '2023-09-01');

INSERT INTO operacion
(id_piloto, id_aeronave, fecha_realizacion, estado, categoria)
VALUES
    (1, 1, '2024-10-01', 'Completada', 'Inspeccion'),
    (1, 1, '2024-11-12', 'Completada', 'Fotogrametria'),
    (2, 2, '2024-12-05', 'Cancelada', 'Audiovisual'),
    (3, 3, '2025-01-15', 'Completada', 'Agricola');