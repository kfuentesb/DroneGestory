# DroneGestory

Requiere Maven Docker npm

Para probar el proyecto en local, ejecutamos el docker-compose.yml en backend e iniciamos SpringBoot
```
cd backend
docker compose up -d
mvn spring-boot:run
```

En otro terminal entramos en frontend e iniciamos React
```
cd ../frontend
npm run dev
```

DOCKER:  Desde la carpeta donde está el docker-compose.yml del backend:
```
docker compose up -d
docker exec -it aeronaves_db psql -U admin -d aeronaves_db

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


npm i react-router

npm install react-router-dom


//TODO LIST
-Conseguir logo
-Sustituir logo de arriba de react por el logo de la empresa
-Conseguir meter iconos para el footer, ya sea descargando .svg o usando una libreria
-Buscar una fuente de letra diferente (pero que siga siendo profesional)
-Conseguir recursos como el fondo de la página oficial (https://dronetools.es/), se difumina y es asi como de mapa de altura de terrenos
-Rellenar IMPLs
-Completar repositorios
-Crear controladores
-Crear config
