# DroneGestory

# Crea un -env
>nano .env <br>
# Configuración de Base de Datos<br>
>DB_USER=admin <br>
>DB_PASSWORD=admin123 <br>
>DB_NAME=aeronaves_db <br>

# Configuración de Red/URLs<br>
>SERVER_IP=YOUR_SERVER_IP <br>
>VITE_API_BASE_URL=http://${SERVER_IP}:8080 <br>


Para montar el proyecto en un servidor desde 0:<br>
# Clona el proyecto
> cd /ruta-donde-tener-el-proyecto
> git clone https://

# Creamos el docker (el que está en la raíz, no el que está en backend)
> docker system prune <br>
> docker image prune -a <br>
> docker compose up -d --build <br>
> docker exec -it dronegestory-db psql -U admin -d aeronaves_db <br>

# Para introducir los datos experimentales utilizar:
> docker exec -i dronegestory-db psql -U admin -d aeronaves_db < ./backend/init.sql <br>
> TRUNCATE TABLE app_user CASCADE;<br>

# Checkear logs
> docker logs dronegestory-backend <br>


# Para probarlo en local y solo usando docker para postgresql:

Requiere Maven Docker npm Java
```diff
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add java
scoop install java/openjdk
scoop install main/maven
mvn -v
-(reinicia)
```

```diff
cd backend
-(tiene que estar up el docker)
docker compose up -d
-(esto crea las tablas automáticamente)
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
-(Abre nuevocmd, inserta lo de init.sql en el terminal)
docker exec -it aeronaves_db psql -U admin -d aeronaves_db
docker exec -i aeronaves_db psql -U admin -d aeronaves_db < ./backend/init.sql
```

En otro terminal entramos en frontend e iniciamos React
```
cd ../frontend
npm run dev
```

## Versión <br>
Node: 24.14.0 <br>
npm: 11.9.0
```
npm create vite@latest frontend
npm run dev
```
Framework: React
Variant: TS + React Compiler
Vite: No

```
npm run dev -- --host
npm i react
npm i react-router
npm i react-router-dom
npm i react-select
npm i react-error-boundary
npm i react-pro-sidebar
npm i react-hook-form
npm i @svar-ui/react-filemanager
```

> Hay un script de python para convertir un string a hash de springboot security, usa esta libreria
```
pip install bcrypt
```


//TODO LIST<br>
VISUAL<br>
-Buscar una fuente de letra diferente (pero que siga siendo profesional) <br>
-Conseguir recursos como el fondo de la página oficial (https://dronetools.es/), se difumina y es asi como de mapa de altura de terrenos <br>

-GENERALES<br>
-Cambiar panel principal para mostrar datos dependiendo del tipo de usuario en sesion.<br>
-Crear la vista de opciones<br>
-Arreglar la toma de IP en local y en servidor<br>

-USUARIO<br>
-Un usuario cualquiera puede manipular certificados de otros manipulando los fetchs. Añadir extra seguridad<br>

-DRONES<br>

-HORAS DE VUELO, MANTENIMIENTO

-OPERACIONES<br>
-Implementar lista de usuarios para clickar y añadir al anexo<br>
-Crear TABLA OTROS
-UAS asignable
-Completar una operacion y rehacer algo como admin, la deja como completada peor se puede editar
-Asignar aeronave en a6, a7
-Hacer que CONOPS de a4 se autorellene en los demás
-Meter opción cancelar
-A5, aptitud para operar. Otros usuarios asignados pueden firmar
-Acceder a una operación siendo un usuario asignados
- A6 es vinculado al a7 por cada aeronave
-Tiempo de vuelo y ciclos de aterrizaje en a7



-DOCUMENTACIONES<br>
-Arreglar la barra de busqueda<br>
-El file manager tiene espacio vertical finito, y puede cortarse información importante. Buscar posibilidad de añadir un scroll lateral izquierdo o aumentar el espacio vertical<br>



COSAS DE MIGRACION DE LA BASE DE DATOS<br>

-- 1. Backup and Move Data
CREATE TABLE aircraft_backup AS SELECT * FROM aircraft;

-- 2. Populate the new Model table
INSERT INTO aircraft_model (manufacturer, model)
SELECT DISTINCT manufacturer, model FROM aircraft_backup;

-- 3. Link Aircraft to the new Models
ALTER TABLE aircraft ADD COLUMN aircraft_model_id INTEGER;

UPDATE aircraft a
SET aircraft_model_id = m.id
FROM aircraft_model m
WHERE a.manufacturer = m.manufacturer 
  AND a.model = m.model;

-- 4. Clean up old columns and constraints
ALTER TABLE aircraft DROP COLUMN manufacturer;
ALTER TABLE aircraft DROP COLUMN model;

-- 5. Wipe documentation (as requested) to avoid "Orphan" errors
DROP TABLE IF EXISTS aircraft_documentation CASCADE;
DROP TABLE IF EXISTS aircraft_model_documentation CASCADE;

-- 6. Upgrade IDs to BIGINT for the remaining tables
ALTER TABLE aircraft ALTER COLUMN aircraft_id TYPE BIGINT;
ALTER TABLE aircraft_model ALTER COLUMN id TYPE BIGINT; -- Note: check if col name is 'id' or 'aircraft_model_id'
ALTER TABLE aircraft ALTER COLUMN aircraft_model_id TYPE BIGINT;

-- 7. Sync the Sequences (CRITICAL)
-- This prevents "Duplicate Key" errors when users try to create new drones
SELECT setval(pg_get_serial_sequence('aircraft', 'aircraft_id'), (SELECT MAX(aircraft_id) FROM aircraft));
SELECT setval(pg_get_serial_sequence('aircraft_model', 'id'), (SELECT MAX(id) FROM aircraft_model));

ALTER TABLE aircraft_model 
  DROP COLUMN max_speed, 
  DROP COLUMN model_name, 
  DROP COLUMN mtom, 
  DROP COLUMN wingspan,
  DROP COLUMN aircraft_class,
  DROP COLUMN config,
  DROP COLUMN impact_energy,
  DROP COLUMN aircraft_model_id;

ALTER TABLE aircraft_model DROP COLUMN aircraft_model_id;