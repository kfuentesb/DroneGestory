# DroneGestory

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

Para probar el proyecto en local, ejecutamos el docker-compose.yml en backend e iniciamos SpringBoot
```diff
cd backend
-(tiene que estar up el docker)
docker compose up -d
-(esto crea las tablas automáticamente)
mvn spring-boot:run
-(Abre nuevocmd, inserta lo de init.sql en el terminal)
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


npm i react
npm i react-router
npm i react-router-dom
npm i react-select
npm i react-error-boundary


> Hay un script de python para convertir un string a hash de springboot security, usa esta libreria
```
pip install bcrypt
```


//TODO LIST
-Conseguir logo
-Sustituir logo de arriba de react por el logo de la empresa
-Conseguir meter iconos para el footer, ya sea descargando .svg o usando una libreria
-Buscar una fuente de letra diferente (pero que siga siendo profesional)
-Conseguir recursos como el fondo de la página oficial (https://dronetools.es/), se difumina y es asi como de mapa de altura de terrenos
- HAY QUE HACER CONTRASEÑA HASHEADA !!!!!

- Cuando haya un error en el registro, indicar exactamente sobre cada input el error dado, y hacer hightlight del borde en rojo