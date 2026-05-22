#!/bin/bash

# Definición de colores para la terminal
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
GRAY='\033[0;90m'
NC='\033[0m' 

# 1. SOLICITAR DATOS AL USUARIO
echo -e "${CYAN}==========================================================${NC}"
echo -e "${CYAN}   SISTEMA DE COPIAS DE SEGURIDAD - DRONE GESTORY (WSL)${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo ""

read -p "Introduce la RUTA LOCAL de tu proyecto (Ej: /mnt/c/Users/Andres/DroneGestory): " localProjectPath
localProjectPath=$(echo "$localProjectPath" | sed "s/['\"]//g")

read -p "Introduce la IP del servidor de Produccion (Ej: 213.165.78.203): " serverIP

read -p "Introduce el usuario SSH [root]: " serverUser
if [ -z "$serverUser" ]; then
    serverUser="root"
fi

echo -e "\n${YELLOW}[+] Validando rutas locales...${NC}"
if [ ! -d "$localProjectPath" ]; then
    echo -e "${RED}[ERROR] La ruta local introducida no existe. Por favor, verifica la ruta.${NC}"
    exit 1
fi

cd "$localProjectPath" || exit 1

# 2. EJECUTAR EL DUMP EN EL SERVIDOR REMOTO
echo -e "\n${YELLOW}[+] Conectando al servidor remoto para generar el volcado SQL...${NC}"
echo -e "${ORANGE}Introduce la contrasena de tu servidor si el sistema te la solicita.${NC}"

ssh "${serverUser}@${serverIP}" "cd /home/DroneGestory && docker exec -t dronegestory-db pg_dump -U admin aeronaves_db > databasecopy.sql"

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Error al generar el archivo SQL en el servidor remoto.${NC}"
    exit 1
fi

# 3. DESCARGAR LOS ARCHIVOS (SCP)
echo -e "\n${YELLOW}[+] Descargando archivo SQL desde produccion...${NC}"
scp "${serverUser}@${serverIP}:/home/DroneGestory/databasecopy.sql" "./"

echo -e "\n${YELLOW}[+] Descargando carpeta /uploads desde produccion...${NC}"
# Forzamos la descarga asegurándonos de que caiga exactamente dentro de la carpeta del backend local
mkdir -p ./backend
scp -r "${serverUser}@${serverIP}:/home/DroneGestory/backend/uploads" "./backend/"

# =========================================================================
# NUEVO: RESPALDO PREVIO DE LA BASE DE DATOS Y UPLOADS LOCALES ACTUALES
# =========================================================================
echo -e "\n${YELLOW}[?] RESPALDO LOCAL PREVIO:${NC}"
read -p "Quieres guardar la base de datos y uploads locales actuales antes de sobrescribir? (S/N): " backupConfirm

if [[ "$backupConfirm" =~ ^[sS]$ ]]; then
    BACKUP_DIR="./database-pre-backup"
    echo -e "\n${YELLOW}[+] Creando carpeta de respaldo previo en: $BACKUP_DIR...${NC}"
    mkdir -p "$BACKUP_DIR"

    # Respaldo de la base de datos local actual
    echo -e "${YELLOW}[+] Generando pre-backup.sql de la base de datos local actual...${NC}"
    docker exec -t aeronaves_db pg_dump -U admin aeronaves_db > "$BACKUP_DIR/pre-backup.sql"

    # Respaldo de la carpeta uploads local actual (si existe)
    if [ -d "./backend/uploads" ]; then
        echo -e "${YELLOW}[+] Copiando carpeta 'uploads' actual al respaldo...${NC}"
        cp -r "./backend/uploads" "$BACKUP_DIR/"
        echo -e "${GREEN}[✓] Respaldo previo creado con éxito.${NC}"
    else
        echo -e "${ORANGE}[!] No se encontró la carpeta './backend/uploads' para respaldar en este momento.${NC}"
    fi
else
    echo -e "\n${ORANGE}[-] Se omitió el respaldo previo de los datos locales.${NC}"
fi
# =========================================================================

# 4. LIMPIAR BASE DE DATOS LOCAL
echo -e "\n${RED}ATENCION: Se va a proceder a BORRAR la base de datos local 'aeronaves_db'...${NC}"
read -p "Deseas continuar? (S/N): " confirm
if [[ ! "$confirm" =~ ^[sS]$ ]]; then
    echo -e "${ORANGE}Operacion cancelada por el usuario.${NC}"
    exit 0
fi

echo -e "\n${YELLOW}[+] Vaciando esquema 'public' en la base de datos local...${NC}"
docker exec -i aeronaves_db psql -U admin -d aeronaves_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 5. RESTAURAR DATOS EN LOCAL
echo -e "\n${YELLOW}[+] Importando el nuevo archivo SQL en la base de datos local...${NC}"
docker exec -i aeronaves_db psql -U admin -d aeronaves_db < "./databasecopy.sql"

# 6. ARREGLAR CARACTERES EXTRAÑOS (Normalizar nombres sustituyendo comas por espacios físicamente)
echo -e "\n${YELLOW}[+] Normalizando nombres de carpetas en el disco (Reemplazando ',' por ' ')...${NC}"

TARGET_DIR="./backend/uploads"
if [ -d "$TARGET_DIR" ]; then
    find "$TARGET_DIR" -type d -name "*,*" | sort -r | while read -r dir; do
        dirname=$(dirname "$dir")
        basename=$(basename "$dir")
        new_basename=$(echo "$basename" | tr ',' ' ')
        
        echo -e "${GRAY}   -> Renombrando carpeta: $basename a: $new_basename${NC}"
        mv "$dir" "$dirname/$new_basename"
    done
else
    echo -e "${ORANGE}No se encontro la carpeta '$TARGET_DIR' para normalizar en disco.${NC}"
fi

# 7. SINCRONIZAR LA BASE DE DATOS CON LOS NUEVOS NOMBRES DE CARPETAS
echo -e "\n${YELLOW}[+] Sincronizando las rutas de los archivos en la Base de Datos...${NC}"
docker exec -i aeronaves_db psql -U admin -d aeronaves_db -c "
UPDATE certificates 
SET la_columna_de_la_ruta = REPLACE(la_columna_de_la_ruta, ',', ' ') 
WHERE la_columna_de_la_ruta LIKE '%,%';
"

echo -e "\n${GREEN}PROCESO COMPLETADO CON EXITO.${NC}"
echo -e "${GREEN}Tu entorno local en WSL ya tiene la copia exacta y funcional de produccion.${NC}"