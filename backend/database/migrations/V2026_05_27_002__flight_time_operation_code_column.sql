-- Add operation_code column to store typed operation codes even when operation record doesn't exist
ALTER TABLE flight_time
ADD COLUMN operation_code VARCHAR(50) NULL AFTER operation_id;

-- Populate operation_code from existing operation references
UPDATE flight_time ft
SET operation_code = (SELECT codigo FROM operation WHERE id_operacion = ft.operation_id)
WHERE ft.operation_id IS NOT NULL;
