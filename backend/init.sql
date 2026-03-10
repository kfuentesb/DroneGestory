-- Insert test users into 'users' table
-- INSERT INTO users
-- (first_name, last_name, username, password_hash, email, phone_number, image_path)
-- VALUES
-- ('Carlos', 'Martinez Lopez', 'cmartinez', '$2a$10$7mCk7/1vI5t8W1NHXrWbUOVY3N7F0IbFZ3Bf0fZQy4XqE5eQmXr1C', 'carlos@skydron.es', 600111333, '/img/carlos.jpg'),
-- ('Lucia', 'Fernandez Ruiz', 'lfernandez', '$2a$10$7mCk7/1vI5t8W1NHXrWbUOVY3N7F0IbFZ3Bf0fZQy4XqE5eQmXr1C', 'lucia@skydron.es', 600111444, '/img/lucia.jpg'),
-- ('Miguel', 'Santos Perez', 'msantos', '$2a$10$7mCk7/1vI5t8W1NHXrWbUOVY3N7F0IbFZ3Bf0fZQy4XqE5eQmXr1C', 'miguel@aerovision.es', 600333555, '/img/miguel.jpg');

INSERT INTO app_user
(type, first_name, last_name, username, password_hash, email, phone_number, image_path)
VALUES
('admin', 'Carlos', 'Martinez Lopez', 'cmartinez', 'pass123', 'carlos@skydron.es', 600111333, 'human-1.jpg'),
('gestor', 'Lucia', 'Fernandez Ruiz', 'lfernandez', 'pass123', 'lucia@skydron.es', 600111444, 'human-2.jpg'),
('pilot', 'Miguel', 'Santos Perez', 'msantos', 'pass123', 'miguel@aerovision.es', 600333555, 'human-3.jpg'),
('pilot', 'Dani', 'Marquez Romero', 'dmarquez', 'pass123', 'dani@aerovision.es', 600444666, 'human-4.jpg'),
('pilot', 'Juan', 'Sánchez Blanco', 'jsanchez', 'pass123', 'juan@aerovision.es', 600555777, 'human-5.jpg');