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
-Cambiar las tablas de mostrar en lista para que se puedan reorganizar por columna<br>

-DRONES<br>
-Cambiar layout de mostrar un dron (imagen grande a la derecha)<br>
-Añadir datos opcionales en aircraft <br>

-OPERACIONES<br>
-Añadir ver operación en detalle<br>
-Implementar lista de usuarios para clickar y añadir al anexo<br>
-Un usuario cualquiera puede manipular certificados de otros manipulando los fetchs. Añadir extra seguridad<br>