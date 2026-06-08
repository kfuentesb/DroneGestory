# DroneGestory 🚁🕹️🛩️

DroneGestory es un sistema completo (full-stack) para la gestión de drones, operadores, documentación técnica y copias de seguridad.

Capturas de pantalla: [screenshots.md](screenshots.md)

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

Utilizado por Vite en tiempo de compilación. Este es únicamente esencial en producción.
Si se hace un "npm run build" asegurate de tener el valor de la url donde está desplegado.

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

### 5. Backups

El guardado de backups para que funcione en este modo, el sistema necesita acceso a los ejecutables `pg_dump` y `psql`, o bien un contenedor Docker de PostgreSQL.

En local, puedes configurar estas variables de entorno opcionales en tu `.env` o en el entorno de ejecución:

* `APP_PG_DUMP_CMD`: comando o ruta de `pg_dump` (por defecto `pg_dump`).
* `APP_PSQL_CMD`: comando o ruta de `psql` (por defecto `psql`).
* `APP_POSTGRES_DOCKER_CONTAINER`: nombre del contenedor PostgreSQL cuando quieres usar `docker exec` como fallback.

Si `pg_dump`/`psql` no están instalados en el host, el backend intentará usar `docker exec` contra un contenedor PostgreSQL válido.

## Estructura de logs de auditoría

Los logs de auditoría se organizan por **mes y año** en la carpeta `backend/AuditLogs/`:

```text
backend/AuditLogs/
├── 2026/
│   ├── 06/
│   │   └── AuditLog-2026-06.csv
│   └── 07/
│       └── AuditLog-2026-07.csv
└── 2027/
    └── 01/
        └── AuditLog-2027-01.csv
```

Cada archivo CSV contiene registros con las columnas:
- `timestamp` - Marca de tiempo en UTC
- `utc_hour` - Hora UTC del evento
- `usuario` - Usuario que ejecutó la acción
- `funcion` - Tipo de acción realizada
- `id` - ID de la entidad afectada
- `detalle` - Detalles adicionales de la acción

Cuando el sistema registra una acción en un mes nuevo, crea automáticamente el archivo y directorio necesarios.

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

Consulta el archivo [LICENSE](LICENSE).





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
