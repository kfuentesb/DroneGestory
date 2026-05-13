---

# DroneGestory 🚁🕹️🛩️𖥂

Sistema integral de gestión de aeronaves (drones), operadores y documentación técnica.

---

## Requisitos Previos

* **Docker & Docker Compose** (Instalado y funcionando)
* **Node.js** (v24.14.0+)
* **npm** (v11.9.0+)
* **Java OpenJDK 17/21**
* **Maven**

---

## Configuración del Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```bash
# Configuración de Base de Datos
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=aeronaves_db

# Configuración de Red
SERVER_IP=YOUR_SERVER_IP
VITE_API_BASE_URL=http://${SERVER_IP}:8080

```

---

## Despliegue en Servidor (Producción)

Para montar el proyecto desde cero en un servidor utilizando contenedores Docker.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/dronegestory.git
cd dronegestory

```

### 2. Construir y levantar contenedores

Se recomienda limpiar imágenes previas para evitar conflictos de caché:

```bash
# Limpieza (Opcional)
docker system prune -f

# Construcción y arranque
docker compose build backend
docker compose build frontend
docker compose up -d

```

### 3. Inicialización de Datos

Para cargar datos experimentales y migraciones iniciales:

```bash
# Cargar esquema e inserciones iniciales
docker exec -i dronegestory-db psql -U admin -d aeronaves_db < ./backend/init.sql

# Ejemplo de ejecución de migraciones manuales
docker exec -i dronegestory-db psql -U admin -d aeronaves_db < backend/database/migrations/V2026_04_22_001__user_multi_roles.sql

```

### 4. Utilidades de Servidor

```bash
# Ver logs del backend
docker logs -f dronegestory-backend

# Entrar a la consola de PostgreSQL
docker exec -it dronegestory-db psql -U admin -d aeronaves_db

```

---

## Configuración Local (Desarrollo)

Para trabajar en local usando Docker solo para la base de datos y corriendo Spring Boot y React de forma nativa.

### 1. Preparación del Entorno (Windows/Scoop)

Si no tienes Java o Maven, puedes usar Scoop:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add java
scoop install java/openjdk maven

```

### 2. Base de Datos Local

Levanta el contenedor de la base de datos:

```bash
cd backend
docker compose up -d

```

### 3. Iniciar Backend (Spring Boot)

Ejecuta el perfil local para que las tablas se creen automáticamente:

```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=local"

```

### 4. Iniciar Frontend (Vite + React)

En una nueva terminal:

```bash
cd frontend
npm install
npm run dev -- --host

```

---

## Estructura de Almacenamiento (Uploads)

El sistema organiza los archivos subidos siguiendo este esquema de rutas:

| Tipo | Ruta de almacenamiento |
| --- | --- |
| **Usuarios** | `uploads/users/{id-username}/...` |
| **Modelos** | `uploads/aircraft-model/{model-manufacturer}/...` |
| **Aeronaves** | `uploads/aircraft/{nserie-model}/...` |

---

## Herramientas Adicionales

### Generador de Hashes (Security)

Si necesitas generar contraseñas compatibles con BCrypt de Spring Security, usa el script de Python incluido:

```bash
pip install bcrypt
python tools/hash_gen.py

```

---

## Roadmap / Pendientes

### Visual

* [ ] Cambiar tipografía a una más profesional.
* [ ] Implementar fondo difuminado tipo "mapa de altura" inspirado en [DroneTools](https://dronetools.es/).

### Seguridad

* [ ] **Importante**: Reforzar seguridad en Fetchs para evitar que usuarios manipulen certificados ajenos mediante ID.

### Funcionalidades

* [ ] Corregir barra de búsqueda en sección documentaciones.
* [ ] Localización de fechas: Formato `DD/MM/YYYY`.
* [ ] Sistema de carpetas dinámico para operadoras.

---
## Tecnologías Principales

* **Backend**: Java, Spring Boot, Spring Security, Maven.
* **Frontend**: React, TypeScript, Vite, React Router, React Hook Form.
* **Base de Datos**: PostgreSQL.
* **DevOps**: Docker, Docker Compose.
* **UI Components**: SVAR UI (File Manager), Pro Sidebar.

---


© 2026 DroneGestory Team






















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

> docker compose build backend <br >
> docker compose build frontend <br>
> docker compose up -d <br>

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
npm i @react-pdf/renderer
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

-USUARIO<br>
-Un usuario cualquiera puede manipular certificados de otros manipulando los fetchs. Añadir extra seguridad<br>
-Borrado de numero de teléfono no funciona<br>

-DRONES<br>

-HORAS DE VUELO<br>

-MANTENIMIENTO<br>

-OPERACIONES<br>

-Historial<br>

-DOCUMENTACIONES<br>
-En ipad no se pueden ver las documentaciones<br>
-La sidebar no se muestra en safari<br>
-Arreglar el borrado de documentaciones, deja las carpetas por detrás<br>
-Arreglar la barra de busqueda<br>
-El file manager tiene espacio vertical finito, y puede cortarse información importante. Buscar posibilidad de añadir un scroll lateral izquierdo o aumentar el espacio vertical<br>

- Dia / mes / año <br>
- Sistema de creacion de carpetas en operadora <br>

MIGRACION

server
docker exec -i dronegestory-db psql -U admin -d aeronaves_db < backend/database/migrations/V2026_04_22_001__user_multi_roles.sql
docker exec -i dronegestory-db psql -U admin -d aeronaves_db < backend/database/migrations/V2026_05_07_001__aircraft_upload_paths_model_first.sql

Rutas de uploads de aeronaves y modelos:
- Modelos de aeronave: `uploads/aircraft-model/{model-manufacturer}/...`
- Aeronaves: `uploads/aircraft/{nserie-model}/...`

TRUNCATE TABLE 
    app_user, 
    app_user_roles, 
    user_certificate, 
    pilots, 
    operation_assigned_users, 
    anexo5_signed_users 
RESTART IDENTITY CASCADE;
