---

# DroneGestory 🚁🕹️🛩️

Sistema integral de gestión de aeronaves (drones), operadores y documentación técnica.

Mira aquí [Project Screenshots](screenshots.md) para ver capturas de la aplicación.
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
EMAIL_PASSWORD=tu-clave
```
---

### Plantilla del archivo `frontend/.env.production`
```
# --- Configuración de url ---
VITE_API_BASE_URL=https://quizzical-morse.213-165-78-203.plesk.page
```

## Despliegue en Servidor (Producción)

> **¡IMPORTANTE (Optimización de Recursos)!**
> Para evitar caídas del servidor por falta de memoria RAM (OOM Killer) debido a las altas demandas de Vite/Node al minificar código, **el frontend NO se compila en el servidor**.
> La compilación se realiza en la máquina local (desarrollo) y se sube la carpeta `dist/` resultante al repositorio. El servidor únicamente levantará un contenedor Nginx ultraligero que servirá dichos archivos estáticos.

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
docker compose up -d db

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

© 2026 DroneGestory Team

## TODO
* AIRCRAFT <br>

* OPERACIONES <br>
-CORREGIR HORAS <br>