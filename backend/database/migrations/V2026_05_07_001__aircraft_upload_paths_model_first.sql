UPDATE aircraft_model
SET image_path = 'aircraft-model/'
    || regexp_replace(model || '-' || manufacturer, '[^a-zA-Z0-9_-]', '_', 'g')
    || '/profile/'
    || regexp_replace(image_path, '^.*[\\/]', '')
WHERE image_path IS NOT NULL
  AND image_path <> '';

UPDATE aircraft
SET image_path = CASE
        WHEN aircraft.image_path LIKE 'aircraft-model/%' THEN
            'aircraft-model/'
            || regexp_replace(aircraft_model.model || '-' || aircraft_model.manufacturer, '[^a-zA-Z0-9_-]', '_', 'g')
            || '/profile/'
            || regexp_replace(aircraft.image_path, '^.*[\\/]', '')
        ELSE
            'aircraft/'
            || regexp_replace(aircraft.serial_number || '-' || aircraft_model.model, '[^a-zA-Z0-9_-]', '_', 'g')
            || '/profile/'
            || regexp_replace(aircraft.image_path, '^.*[\\/]', '')
    END
FROM aircraft_model
WHERE aircraft.aircraft_model_id = aircraft_model.id
  AND aircraft.image_path IS NOT NULL
  AND aircraft.image_path <> '';

UPDATE aircraft_model_documentation
SET documentation_name = 'aircraft-model/'
    || regexp_replace(aircraft_model.model || '-' || aircraft_model.manufacturer, '[^a-zA-Z0-9_-]', '_', 'g')
    || '/documentation/'
    || regexp_replace(
        COALESCE(NULLIF(aircraft_model_documentation.documentation_type, ''), 'unknown'),
        '[^a-zA-Z0-9_-]',
        '_',
        'g'
    )
    || '/'
    || regexp_replace(aircraft_model_documentation.documentation_name, '^.*[\\/]', '')
FROM aircraft_model
WHERE aircraft_model_documentation.aircraft_model_id = aircraft_model.id
  AND aircraft_model_documentation.documentation_name IS NOT NULL
  AND aircraft_model_documentation.documentation_name ~ '[\\/]';

UPDATE aircraft_documentation
SET documentation_name = 'aircraft/'
    || regexp_replace(aircraft.serial_number || '-' || aircraft_model.model, '[^a-zA-Z0-9_-]', '_', 'g')
    || '/documentation/'
    || regexp_replace(
        COALESCE(NULLIF(aircraft_documentation.documentation_type, ''), 'unknown'),
        '[^a-zA-Z0-9_-]',
        '_',
        'g'
    )
    || '/'
    || regexp_replace(aircraft_documentation.documentation_name, '^.*[\\/]', '')
FROM aircraft
JOIN aircraft_model ON aircraft.aircraft_model_id = aircraft_model.id
WHERE aircraft_documentation.aircraft_id = aircraft.aircraft_id
  AND aircraft_documentation.documentation_name IS NOT NULL
  AND aircraft_documentation.documentation_name ~ '[\\/]';
