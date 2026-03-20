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

```
npm run dev -- --host
npm i react
npm i react-router
npm i react-router-dom
npm i react-select
npm i react-error-boundary
npm i react-pro-sidebar
npm i react-hook-form
```

> Hay un script de python para convertir un string a hash de springboot security, usa esta libreria
```
pip install bcrypt
```


//TODO LIST<br>
VISUAL<br>
-Conseguir logo. Sustituir logo de arriba de react por el logo de la empresa <br>
-Conseguir meter iconos para el footer, ya sea descargando .svg o usando una libreria <br>
-Buscar una fuente de letra diferente (pero que siga siendo profesional) <br>
-Conseguir recursos como el fondo de la página oficial (https://dronetools.es/), se difumina y es asi como de mapa de altura de terrenos <br>
-Cambiar layout de mostrar un dron (imagen grande a la derecha)<br>
-Cambiar footer, actualmente es footer para una página genérica, no aporta nada, pero no borrarlo. <br>
FUNCIONAL<br>
-Añadir datos opcionales en aircraft <br>
-Añadir posibilidad de borrar imagen en modificar, tanto para usuario como para dron<br>
-Reestructurar la carpeta del backend /uploads, que tenga una con /users y otra con /aircraft, además aquí se guardaran las licencias y documentaciones a futuro<br>
-Cambiar las tablas de mostrar en lista para que se puedan reorganizar por columna<br>
-Añadir ver operación en detalle<br>
-Implementar lista de usuarios para clickar y añadir al anexo<br>
-Añadir paginación a las vistas con tablas.<br>