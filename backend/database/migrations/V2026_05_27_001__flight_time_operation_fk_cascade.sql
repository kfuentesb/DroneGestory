-- Set operation_id FK to ON DELETE SET NULL so flight_times persist when operation is deleted
ALTER TABLE flight_time
DROP CONSTRAINT IF EXISTS flight_time_ibfk_2;

ALTER TABLE flight_time
ADD CONSTRAINT flight_time_ibfk_2
FOREIGN KEY (operation_id) REFERENCES operation(id_operacion) ON DELETE SET NULL;
