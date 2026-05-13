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

## Configuración del Entorno (`.env`)

Para que el sistema funcione correctamente, es necesario crear un archivo **`.env`** dentro de la carpeta `backend/`. Este archivo gestiona las credenciales sensibles que no deben subirse al repositorio.

### Plantilla del archivo `.env`

```properties
# --- Configuración de Red ---
SERVER_IP=YOUR_SERVER_IP
VITE_API_BASE_URL=http://${SERVER_IP}:8080
```

### Plantilla del archivo `backend/.env`

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
EMAIL_PASSWORD=tu_clave_de_16_letras_sin_espacios
```

---

## Despliegue en Servidor (Producción)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/dronegestory.git
cd dronegestory

```

### 2. Preparar credenciales

Copia el archivo `.env` configurado anteriormente dentro de `backend/`. Asegúrate de que `JWT_SECRET` sea una clave robusta para producción.

### 3. Construir y levantar contenedores

```bash
# Limpieza (Opcional)
docker system prune -f

# Construcción y arranque
docker compose build
docker compose up -d

```

### 4. Inicialización de Datos

```bash
# Cargar esquema e inserciones iniciales
docker exec -i dronegestory-db psql -U admin -d aeronaves_db < ./backend/init.sql

```

---

## Configuración Local (Desarrollo)

### 1. Base de Datos

Levanta solo el contenedor de PostgreSQL:

```bash
cd backend
docker compose up -d db

```

### 2. Iniciar Backend (Spring Boot)

Asegúrate de tener el `.env` en la raíz de la carpeta `backend`. El perfil `local` usará el archivo `.env` mediante la importación configurada en `application-local.yaml`.

```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=local"

```

### 3. Iniciar Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev

```

---

## Estructura de Almacenamiento (Uploads)

| Tipo | Ruta de almacenamiento |
| --- | --- |
| **Usuarios** | `uploads/users/{id-username}/...` |
| **Modelos** | `uploads/aircraft-model/{model-manufacturer}/...` |
| **Aeronaves** | `uploads/aircraft/{nserie-model}/...` |

---

## Seguridad y JWT

* **JWT Secret**: Es fundamental que en producción esta variable esté configurada en el `.env`. Si no se detecta, el sistema usará un valor por defecto que **no es seguro**.
* **Email**: El sistema utiliza Gmail SMTP. Asegúrate de tener activa la "Verificación en 2 pasos" y generar una "App Password" específica.

---

## Tecnologías Principales

* **Backend**: Java 21, Spring Boot 4.x, Spring Security (JWT), Maven.
* **Frontend**: React, TypeScript, Vite.
* **Base de Datos**: PostgreSQL.
* **DevOps**: Docker, Docker Compose.

---

© 2026 DroneGestory Team