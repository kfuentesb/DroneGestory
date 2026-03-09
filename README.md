# DroneGestory

Requiere Maven Docker npm Java
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add java
scoop install java/openjdk
scoop install main/maven
mvn -v
<span style="color : red">(reinicia)</span>
```

Para probar el proyecto en local, ejecutamos el docker-compose.yml en backend e iniciamos SpringBoot
```
cd backend
<span style="color : red">(tiene que estar up el docker)</span>
docker compose up -d
<span style="color : red">(esto crea las tablas automáticamente)</span>
mvn spring-boot:run
<span style="color : red">(Abre nuevocmd, inserta lo de init.sql en el terminal)</span>
docker exec -it aeronaves_db psql -U admin -d aeronaves_db
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


npm i react-router

npm install react-router-dom


//TODO LIST
-Conseguir logo
-Sustituir logo de arriba de react por el logo de la empresa
-Conseguir meter iconos para el footer, ya sea descargando .svg o usando una libreria
-Buscar una fuente de letra diferente (pero que siga siendo profesional)
-Conseguir recursos como el fondo de la página oficial (https://dronetools.es/), se difumina y es asi como de mapa de altura de terrenos
- HAY QUE HACER CONTRASEÑA HASHEADA !!!!!
