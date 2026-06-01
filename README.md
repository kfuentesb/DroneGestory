```markdown
# DroneGestory

Para leer este archivo en español, haz clic aquí: **[Español](#español)** To read this file in English, click here: **[English](#english)**

---

<a name="english"></a>
# English Version

DroneGestory is a full-stack system for managing drones, operators, technical documentation, and backups.

Screenshots: [screenshots.md](screenshots.md)

## What is in the repo

- `backend/`: Spring Boot API, PostgreSQL integration, file handling, and backup endpoints.
- `frontend/`: Vite + React UI.
- `compose.yaml`: root Docker stack for production-like deployment.
- `backups/`: generated backup outputs.
- `download_backup.sh`, `monthly_backup.sh`, `restore_local_with_backup.sh`: backup helper scripts.

## Requirements

### Local development

- Docker and Docker Compose
- Java 21
- Maven
- Node.js 24.x
- npm 11.x

### Production or server deployment

- Docker and Docker Compose
- A `.env` file at the repo root
- A built frontend `dist/` directory before building the frontend image

## Environment files

The project uses different `.env` files depending on how you run it.

### Root `.env`

Used by `compose.yaml` and the Dockerized stack.

```properties
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=aeronaves_db

JWT_SECRET=change-this-to-a-long-random-value
JWT_EXPIRATION_MS=86400000

EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

APP_FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8080

```

### `backend/.env`

Used by the Spring Boot app when you run it locally with the `local` profile.

```properties
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

JWT_SECRET=change-this-to-a-long-random-value
JWT_EXPIRATION_MS=86400000

APP_FRONTEND_URL=http://localhost:5173,[http://127.0.0.1:5173](http://127.0.0.1:5173)

```

### `frontend/.env`

Used by Vite at build time.

```properties
VITE_API_BASE_URL=http://localhost:8080

```

If you build the frontend for production, set `VITE_API_BASE_URL` to the public backend URL before running `npm run build`.

## Run locally

This is the recommended setup for day-to-day development.

### 1. Start PostgreSQL

From the repo root:

```bash
cd backend
docker compose up -d postgres

```

### 2. Start the backend

Make sure `backend/.env` exists first.

```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"

```

The local profile imports `backend/.env` automatically.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev

```

### 4. Optional database initialization

If you need to seed the database manually:

```bash
docker exec -it aeronaves_db psql -U admin -d aeronaves_db
docker exec -i aeronaves_db psql -U admin -d aeronaves_db < ./backend/init.sql

```

## Run in production

The root Docker stack is defined in `compose.yaml`.

### 1. Build the frontend locally

The frontend image does not build Vite inside the container. It copies the prebuilt `dist/` folder instead.

```bash
cd frontend
npm install
npm run build

```

### 2. Prepare the root `.env`

Create the root `.env` file and set the production values for database, email, JWT, and CORS/frontend URLs.

### 3. Start the stack

From the repo root:

```bash
docker compose up -d --build

```

### 4. Check logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

```

### 5. Useful production notes

* `compose.yaml` uses the root `.env`.
* The backend container includes `postgresql-client-16`, which is required for backup and restore commands.
* Uploaded files, audit logs, and generated backups are mounted as persistent volumes/directories.
* If you change the frontend code, rebuild `frontend/dist/` and then rebuild the frontend image.

## Backups

The application now supports backups from the UI and from shell scripts.

### Web backups

Users with `ADMIN` or `MANAGER` access can manage backups from the configuration screen.

From the UI you can:

* change the automatic backup day of the month,
* run a manual backup immediately,
* download a backup package,
* restore a backup from a `.zip` or `.sql` file.

Generated backup packages contain:

* `postgredatabase.sql`
* `backend/uploads/`
* `backend/AuditLogs/` if present

The backup service stores the latest run metadata in the database and writes scheduled backups under `backups/YYYY-MM-DD/`.

### Automatic monthly backup on the server

From the repo root on the production server:

```bash
chmod +x install_monthly_backup_cron.sh
./install_monthly_backup_cron.sh

```

This installs a cron job that runs `monthly_backup.sh` at `02:00` on day `1` of every month.

The script writes backups to:

```text
backups/YYYY-MM-DD/
  postgredatabase.sql
  backend/uploads/
  backend/AuditLogs/

```

If `backend/AuditLogs` does not exist, it is skipped.

### Manual download and local restore

The helper scripts are intended for Linux or WSL.

```bash
chmod +x download_backup.sh restore_local_with_backup.sh

```

* `download_backup.sh` connects to the production server over SSH, creates a database dump, and downloads the dump plus `backend/uploads`.
* `restore_local_with_backup.sh` restores a legacy local backup into an existing local project.

Note: the legacy restore script expects `databasecopy.sql` and `uploads/`. The newer application backup flow uses `postgredatabase.sql` inside the generated backup package.

## File storage

The main runtime folders are:

| Type | Path |
| --- | --- |
| Users | `uploads/users/{id-username}/...` |
| Aircraft models | `uploads/aircraft-model/{model-manufacturer}/...` |
| Aircraft | `uploads/aircraft/{nserie-model}/...` |
| Operations | `uploads/operations/{codigo}/...` |
| Operation documentation | `uploads/operation-documentation/{file-name}` |

## Security notes

* Keep `JWT_SECRET` long and random in production.
* Gmail SMTP requires a Google App Password.
* `backend/string-to-hash.py` can generate hashed passwords for manual user creation.

## Main technologies

* Backend: Java 21, Spring Boot 4, Spring Security, Maven
* Frontend: React, TypeScript, Vite
* Database: PostgreSQL
* Deployment: Docker, Docker Compose

## Project structure

```text
.
|-- backend/
|-- frontend/
|-- backups/
|-- compose.yaml
|-- download_backup.sh
|-- install_monthly_backup_cron.sh
|-- monthly_backup.sh
|-- restore_local_with_backup.sh
|-- README.md

```

## License

See [LICENSE](https://www.google.com/search?q=LICENSE).

---

# Versión en Español

DroneGestory es un sistema completo (full-stack) para la gestión de drones, operadores, documentación técnica y copias de seguridad.

Capturas de pantalla: [screenshots.md](https://www.google.com/search?q=screenshots.md)

## Qué hay en el repositorio

* `backend/`: API de Spring Boot, integración con PostgreSQL, gestión de archivos y endpoints de respaldo.
* `frontend/`: Interfaz de usuario con Vite + React.
* `compose.yaml`: Infraestructura de Docker raíz para despliegues similares a producción.
* `backups/`: Salidas generadas de las copias de seguridad.
* `download_backup.sh`, `monthly_backup.sh`, `restore_local_with_backup.sh`: Scripts auxiliares para la gestión de respaldos.

## Requisitos

### Desarrollo local

* Docker y Docker Compose
* Java 21
* Maven
* Node.js 24.x
* npm 11.x

### Despliegue en servidor o producción

* Docker y Docker Compose
* Un archivo `.env` en la raíz del repositorio
* El directorio frontend `dist/` compilado antes de construir la imagen del frontend

## Archivos de entorno

El proyecto utiliza diferentes archivos `.env` según la forma en que se ejecute.

### `.env` Raíz

Utilizado por `compose.yaml` y la infraestructura Dockerizada.

```properties
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=aeronaves_db

JWT_SECRET=cambia-esto-por-un-valor-largo-y-aleatorio
JWT_EXPIRATION_MS=86400000

EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicación-de-google

APP_FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8080

```

### `backend/.env`

Utilizado por la aplicación Spring Boot cuando se ejecuta localmente con el perfil `local`.

```properties
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicación-de-google

JWT_SECRET=cambia-esto-por-un-valor-largo-y-aleatorio
JWT_EXPIRATION_MS=86400000

APP_FRONTEND_URL=http://localhost:5173,[http://127.0.0.1:5173](http://127.0.0.1:5173)

```

### `frontend/.env`

Utilizado por Vite en tiempo de compilación.

```properties
VITE_API_BASE_URL=http://localhost:8080

```

Si compilas el frontend para producción, establece `VITE_API_BASE_URL` con la URL pública del backend antes de ejecutar `npm run build`.

## Ejecución en local

Esta es la configuración recomendada para el desarrollo diario.

### 1. Iniciar PostgreSQL

Desde la raíz del repositorio:

```bash
cd backend
docker compose up -d postgres

```

### 2. Iniciar el backend

Asegúrate de que el archivo `backend/.env` exista primero.

```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"

```

El perfil local importará `backend/.env` de forma automática.

### 3. Iniciar el frontend

```bash
cd frontend
npm install
npm run dev

```

### 4. Inicialización opcional de la base de datos

Si necesitas cargar datos iniciales en la base de datos manualmente:

```bash
docker exec -it aeronaves_db psql -U admin -d aeronaves_db
docker exec -i aeronaves_db psql -U admin -d aeronaves_db < ./backend/init.sql

```

## Ejecución en producción

La infraestructura Docker raíz está definida en `compose.yaml`.

### 1. Compilar el frontend localmente

La imagen del frontend no compila Vite dentro del contenedor. En su lugar, copia la carpeta `dist/` previamente compilada.

```bash
cd frontend
npm install
npm run build

```

### 2. Preparar el `.env` raíz

Crea el archivo `.env` raíz y configura los valores de producción para la base de datos, correo electrónico, JWT y las URLs de CORS/frontend.

### 3. Iniciar los contenedores

Desde la raíz del repositorio:

```bash
docker compose up -d --build

```

### 4. Revisar logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

```

### 5. Notas útiles de producción

* `compose.yaml` utiliza el archivo `.env` de la raíz.
* El contenedor del backend incluye `postgresql-client-16`, necesario para los comandos de copia de seguridad y restauración.
* Los archivos subidos, los registros de auditoría y los respaldos generados se montan como volúmenes o directorios persistentes.
* Si realizas cambios en el código del frontend, vuelve a compilar `frontend/dist/` y reconstruye la imagen del frontend.

## Copias de seguridad (Backups)

La aplicación permite gestionar copias de seguridad tanto desde la interfaz web como a través de scripts de terminal.

### Respaldos desde la web

Los usuarios con acceso de `ADMIN` o `MANAGER` pueden administrar los respaldos desde la pantalla de configuración.

Desde la interfaz de usuario puedes:

* Cambiar el día del mes en que se realiza el respaldo automático.
* Ejecutar un respaldo manual de forma inmediata.
* Descargar un paquete de copia de seguridad.
* Restaurar un respaldo a partir de un archivo `.zip` o `.sql`.

Los paquetes de respaldo generados contienen:

* `postgredatabase.sql`
* `backend/uploads/`
* `backend/AuditLogs/` (si está presente)

El servicio de respaldo almacena los metadatos de la última ejecución en la base de datos y escribe los respaldos programados en `backups/AAAA-MM-DD/`.

### Respaldo mensual automático en el servidor

Desde la raíz del repositorio en el servidor de producción:

```bash
chmod +x install_monthly_backup_cron.sh
./install_monthly_backup_cron.sh

```

Esto instalará una tarea programada (cron job) que ejecuta `monthly_backup.sh` a las `02:00` el día `1` de cada mes.

El script escribe los respaldos en:

```text
backups/AAAA-MM-DD/
  postgredatabase.sql
  backend/uploads/
  backend/AuditLogs/

```

Si `backend/AuditLogs` no existe, se omitirá.

### Descarga manual y restauración local

Los scripts auxiliares están diseñados para Linux o WSL.

```bash
chmod +x download_backup.sh restore_local_with_backup.sh

```

* `download_backup.sh` se conecta al servidor de producción a través de SSH, realiza un volcado de la base de datos y lo descarga junto con la carpeta `backend/uploads`.
* `restore_local_with_backup.sh` restaura una copia de seguridad local heredada en un proyecto local existente.

Nota: El script de restauración heredado espera encontrar `databasecopy.sql` y `uploads/`. El nuevo flujo de respaldo de la aplicación utiliza `postgredatabase.sql` dentro del paquete de copia de seguridad generado.

## Almacenamiento de archivos

Las carpetas principales en tiempo de ejecución son:

| Tipo | Ruta |
| --- | --- |
| Usuarios | `uploads/users/{id-username}/...` |
| Modelos de aeronaves | `uploads/aircraft-model/{model-manufacturer}/...` |
| Aeronaves | `uploads/aircraft/{nserie-model}/...` |
| Operaciones | `uploads/operations/{codigo}/...` |
| Documentación de operaciones | `uploads/operation-documentation/{file-name}` |

## Notas de seguridad

* Mantén el `JWT_SECRET` con un valor largo y aleatorio en entornos de producción.
* El servidor SMTP de Gmail requiere una contraseña de aplicación de Google.
* Se puede utilizar `backend/string-to-hash.py` para generar contraseñas cifradas en caso de creación manual de usuarios.

## Tecnologías principales

* Backend: Java 21, Spring Boot 4, Spring Security, Maven
* Frontend: React, TypeScript, Vite
* Base de datos: PostgreSQL
* Despliegue: Docker, Docker Compose

## Estructura del proyecto

```text
.
|-- backend/
|-- frontend/
|-- backups/
|-- compose.yaml
|-- download_backup.sh
|-- install_monthly_backup_cron.sh
|-- monthly_backup.sh
|-- restore_local_with_backup.sh
|-- README.md

```

## Licencia

Consulta el archivo [LICENSE](https://www.google.com/search?q=LICENSE).

```

```














































---

# DroneGestory 🚁🕹️🛩️

Sistema integral de gestión de aeronaves (drones), operadores y documentación técnica.

Mira aquí [Project Screenshots](screenshots.md) para ver capturas de la aplicación.
---

## Requisitos Previos

### Producción
* **Docker & Docker Compose**
* **Git** 

### Desarrollo
* **Docker & Docker Compose** (Instalado y funcionando)
* **Node.js** (v24.14.0+)
* **npm** (v11.9.0+)
* **Java OpenJDK 21**
* **Maven**

```bash
sudo apt update
sudo apt install -y openjdk-21-jdk
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
## esto solo para que no tengas que refrescar el terminal y salga node -v
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
###
nvm install 24.14.0
nvm alias default 24.14.0
nvm use default
rm -rf node_modules package-lock.json
cd frontend
npm i
```
---

## Configuración del Entorno (`.env`)

Para que el sistema funcione correctamente, es necesario crear un archivo **`.env`** dentro de la carpeta `backend/`. Este archivo gestiona las credenciales sensibles que no deben subirse al repositorio.

### Plantilla del archivo `.env`

```properties
# --- Configuración de API (Local) ---
VITE_API_BASE_URL=http://localhost:8080
APP_FRONTEND_URL=http://localhost:5173,[http://127.0.0.1:5173](http://127.0.0.1:5173)

# --- Base de Datos (Replicadas aquí para Docker Compose) ---
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=aeronaves_db

# --- Configuración de Email (Gmail) ---
# Requiere "Contraseña de Aplicación" de Google
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-clave-de-aplicacion
```

#### 1. Plantilla para el Backend (`backend/.env`)
Crea un archivo llamado `.env` en la raíz de la carpeta del backend.

```properties
# --- Base de Datos ---
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=aeronaves_db

# --- Seguridad JWT ---
# Genera una cadena aleatoria de al menos 32 caracteres
JWT_SECRET=tu_clave_secreta_super_larga_y_segura_123456
JWT_EXPIRATION_MS=86400000

# --- Configuración de Email (Gmail) ---
# Requiere "Contraseña de Aplicación" de Google
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-clave-de-aplicacion

# --- Configuración de Red ---
# Lista de URLs del Frontend permitidas por CORS (separadas por comas)
APP_FRONTEND_URL=http://localhost:5173,[http://127.0.0.1:5173](http://127.0.0.1:5173)
---
```

#### Plantilla del archivo (`frontend/.env`)

> **!IMPORTANTE¡**
> Esta variable es importante para la producción, para unicamente ejecutarlo en local no es necesario, pero al hacer npm run build, tenerlo si o si
```
# --- Configuración de API (Producción) ---
VITE_API_BASE_URL=IP_O_DNS
```

## Despliegue en Servidor (Producción)

> **¡IMPORTANTE (Optimización de Recursos)!**
> Para evitar caídas del servidor por falta de memoria RAM (OOM Killer) debido a las altas demandas de Vite/Node al minificar código, **el frontend NO se compila en el servidor**.
> La compilación se realiza en la máquina local (desarrollo) y se sube la carpeta `dist/` resultante al repositorio. El servidor únicamente levantará un contenedor Nginx ultraligero que servirá dichos archivos estáticos.
> Es importante hacer npm run build con VITE_API_BASE_URL asignado en /frontend/.env para que se cargue bien el valor en el servidor

### 1. Clonar o pullear última versión el repositorio

```bash
git clone https://github.com/tu-usuario/dronegestory.git
cd dronegestory

git pull origin main

```

### 2. Preparar credenciales

Copia los archivos `.env` e introduzca en raíz y en `backend/`. Asegúrate de que `JWT_SECRET` sea una clave robusta para producción.

### 3. Construir y levantar contenedores

```bash
# Limpieza (Opcional)
docker system prune -f

# Construcción y arranque (todo a la vez)
docker compose build -d
docker compose up -d
# Construcción y arranque por partes (recomendado)
docker compose pull db
docker compose up -d db
docker compose build backend
docker compose build --no-cache frontend
docker compose up -d
# Para ver logs
docker compose logs backend
docker compose logs frontend
```

### 4. Inicialización de Datos

```bash
# Espera a que el backend cargue para que se generen las tablas
# Ejecutar postgresql
docker exec -it dronegestory-db psql -U admin -d aeronaves_db
# Cargar esquema e inserciones iniciales (solo usuario admin)
docker exec -i dronegestory-db psql -U admin -d aeronaves_db < ./backend/init.sql

```

---

## Configuración Local (Desarrollo)

### 1. Base de Datos

Levanta solo el contenedor de PostgreSQL:

```bash
cd backend
docker compose up -d postgres

```

### 2. Iniciar Backend (Spring Boot)

Asegúrate de tener el `.env` en la raíz de la carpeta `backend`. El perfil `local` usará el archivo `.env` mediante la importación configurada en `application-local.yaml`.

```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=local"

```

### 3. Iniciar Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev

```

### 4. Inificar PostgreSQL

```bash
# Ejecutar postgresql
docker exec -it aeronaves_db psql -U admin -d aeronaves_db
# Cargar esquema e inserciones iniciales (solo usuario admin)
cmd
docker exec -i aeronaves_db psql -U admin -d aeronaves_db < ./backend/init.sql
exit
```

### 5. ¡¡ANTES DE SUBIR CAMBIOS!!

Así se sube la nueva versión de dist para el servidor.

```bash
cd frontend
npm run build
```

## Estructura de carpetas

```
.
├── backend/
│   ├── database/migrations (Para migrar o hacer cambios a la base de datos)
│   ├── src/main/
│   │    ├── java/com/dronetools/dronegrestory/
│   │    │   ├── common/
│   │    │   ├── config/ (SecurityConfig declara el rango de visión en base al rol del usuario)
│   │    │   ├── controller/
│   │    │   ├── dto/
│   │    │   ├── exception/
│   │    │   ├── model/
│   │    │   ├── repository/
│   │    │   ├── security/
│   │    │   ├── service/
│   │    │   ├── util/
│   │    │   └── DroneGestoryApplication.java
│   │    └── resources/ (.yaml para local y servidor )
│   ├── docker-compose.yml ( postgresql database para desarrollo )
│   ├── Dockerfile ( docker para montar el backend en despliegue )
│   ├── init.sql ( Insert para crear primer usuario admin )
│   ├── pom.xml
│   ├── string-to-hash.py (Script para generar contraseñas hasheadas )
│   └── .env/ ( properties / Seguridad JWT / Configuración de Email (Gmail) )
│
├── frontend/
│   ├── public/ ( imágenes )
│   ├── src/
│   │    ├── assets/
│   │    ├── components/
│   │    │    ├── certificates/
│   │    │    ├── commons/ ( Componentes reutilizados en diferentes partes del proyecto)
│   │    │    │    ├── hooks/
│   │    │    │    ├── MultiStepForm/
│   │    │    │    ├── props/
│   │    │    │    └── * 
│   │    │    ├── dashboard/
│   │    │    ├── details/ ( Vista detallada del elemento )
│   │    │    │    ├── aircraft/
│   │    │    │    ├── operation/
│   │    │    │    ├── user&profile/
│   │    │    │    └── DetailsComponent.tsx ( Vista reutilizada para ver los detalles)
│   │    │    ├── docs/
│   │    │    ├── forms/
│   │    │    ├── layout/ ( Distribución principal del proyecto: sidebar, botón hamburguesa)
│   │    │    ├── lists/
│   │    │    ├── mail/
│   │    │    ├── main-elements-views/ ( Elementos principales: footer, 403, 404, home, login, navbar, sidebar, etc)
│   │    │    ├── operations/
│   │    │    ├── pdf/
│   │    │    └── AuthPorvider.tsx
│   │    ├── global-const/
│   │    ├── router/
│   │    │    ├── ProtectedRoute.tsx
│   │    │    └── RouterPrincipal.tsx
│   │    ├── styles/
│   │    ├── api.ts
│   │    ├── App.css
│   │    ├── App.tsx
│   │    ├── index.css
│   │    └── main.tsx
│   ├── nginx.conf
│   ├── vite.config.ts
│   ├── Dockerfile ( docker para montar frontend en despliegue )
│   └── index.html
│
├── .gitattributes
├── .gitignore
├── .env (SERVER_IP / VITE_API_BASE_URL)
└── compose.yaml (Docker del servidor: backend, frontend, postgresql)
```

---

## Estructura de Almacenamiento (Uploads)

| Tipo | Ruta de almacenamiento |
| --- | --- |
| **Usuarios** | `uploads/users/{id-username}/...` |
| **Modelos** | `uploads/aircraft-model/{model-manufacturer}/...` |
| **Aeronaves** | `uploads/aircraft/{nserie-model}/...` |
| **Operaciones** | `uploads/operations/{codigo}/...` |
| **Documentación Operaciones** | `uplodas/operation-documentation/{file-name}`|

---

## Seguridad y JWT

* **JWT Secret**: Es fundamental que en producción esta variable esté configurada en el `.env`. Si no se detecta, el sistema usará un valor por defecto que **no es seguro**.
* **Email**: El sistema utiliza Gmail SMTP. Asegúrate de tener activa la "Verificación en 2 pasos" y generar una "App Password" específica.
* **Password hasher**: En backend/string-to-hash.py hay un script para hashear texto, por si hace falta generar usuarios de forma manual.
---

## Tecnologías Principales

* **Backend**: Java 21, Spring Boot 4.x, Spring Security (JWT), Maven.
* **Frontend**: React, TypeScript, Vite.
* **Base de Datos**: PostgreSQL.
* **DevOps**: Docker, Docker Compose.

---

## BACKUPS

### DESCARGAR DATOS DE PRODUCCIÓN DE FORMA MANUAL (WSL)

IMPORTANTE
> Actualmente solo permite la bajada de backup y la subida del backup a un proyecto en local, no se puede
> subir a producción un back-up. 

(Recuerda dar permisos a los bash para que se puedan ejecutar)
```bash
chmod +x nombre_del_bash.sh
```

Para bajarte una copia de todos los datos en producción:
```bash
download_backup.sh
```

Para subir los datos del backup al un proyecto local:
```bash
restore_local_with_backup.sh
```

### BACKUP AUTOMATICO MENSUAL EN PRODUCCION

En el servidor de produccion, desde la raiz del proyecto:

```bash
chmod +x install_monthly_backup_cron.sh
./install_monthly_backup_cron.sh
```

Esto instala una tarea cron para ejecutar `monthly_backup.sh` a las 02:00 del dia 1 de cada mes.

Cada backup se guarda en `backups/YYYY-MM-DD/` con esta estructura:

```text
postgredatabase.sql
backend/uploads/
backend/AuditLogs/
```

Si `backend/AuditLogs` todavia no existe, el script lo omite sin fallar.

### BACKUPS DESDE LA WEB

Los usuarios `ADMIN` y `MANAGER` pueden gestionar los backups desde `Configuracion`.

Desde esa vista se puede:

```text
Elegir el dia del mes para el backup automatico.
Ejecutar un backup manual al momento.
Consultar la ultima fecha y ruta del backup generado.
```

El backend genera los backups en `backups/YYYY-MM-DD/`. En despliegues Docker hay que reconstruir la imagen del backend para instalar `pg_dump`:

```bash
docker compose build backend
docker compose up -d backend
```

### DESCARGAR DATOS DE PRODUCCIÓN DE FORMA MANUAL (Windows 10/11)

Aún no funciona
```bash
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\backup_dronegestory.ps1
```



© 2026 DroneGestory Team
