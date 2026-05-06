UPDATE aircraft_documentation
SET documentation_name = regexp_replace(documentation_name, '^.*[\\/]', '')
WHERE documentation_name IS NOT NULL
  AND documentation_name ~ '[\\/]';

UPDATE aircraft_model_documentation
SET documentation_name = regexp_replace(documentation_name, '^.*[\\/]', '')
WHERE documentation_name IS NOT NULL
  AND documentation_name ~ '[\\/]';
