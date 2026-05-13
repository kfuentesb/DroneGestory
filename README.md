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

* Cambiar tipografía a una más profesional.
* Implementar fondo difuminado tipo "mapa de altura" inspirado en [DroneTools](https://dronetools.es/).

### Seguridad

* **Importante**: Reforzar seguridad en Fetchs para evitar que usuarios manipulen certificados ajenos mediante ID.

### Funcionalidades

* Corregir barra de búsqueda en sección documentaciones.
* Localización de fechas: Formato `DD/MM/YYYY`.

---
## Tecnologías Principales

* **Backend**: Java, Spring Boot, Spring Security, Maven.
* **Frontend**: React, TypeScript, Vite, React Router, React Hook Form.
* **Base de Datos**: PostgreSQL.
* **DevOps**: Docker, Docker Compose.
* **UI Components**: SVAR UI (File Manager), Pro Sidebar.

---


© 2026 DroneGestory Team