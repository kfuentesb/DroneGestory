UPDATE app_user
SET image_path = regexp_replace(image_path, '^.*[\\/]', '')
WHERE image_path IS NOT NULL
  AND image_path ~ '[\\/]';

UPDATE user_certificate
SET certificate_name = regexp_replace(certificate_name, '^.*[\\/]', '')
WHERE certificate_name IS NOT NULL
  AND certificate_name ~ '[\\/]';

UPDATE document_versions
SET file_url = regexp_replace(file_url, '^.*[\\/]', '')
WHERE file_url IS NOT NULL
  AND file_url ~ '[\\/]';

UPDATE anexo4
SET imagen_espacio_aereo = regexp_replace(imagen_espacio_aereo, '^.*[\\/]', '')
WHERE imagen_espacio_aereo IS NOT NULL
  AND imagen_espacio_aereo ~ '[\\/]';

UPDATE anexo4
SET imagen_zona_vuelo = regexp_replace(imagen_zona_vuelo, '^.*[\\/]', '')
WHERE imagen_zona_vuelo IS NOT NULL
  AND imagen_zona_vuelo ~ '[\\/]';
