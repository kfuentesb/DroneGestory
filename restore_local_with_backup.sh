#!/bin/bash

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
GRAY='\033[0;90m'
NC='\033[0m' 

echo -e "${CYAN}==========================================================${NC}"
echo -e "${CYAN}       RESTAURAR BACKUP LOCAL EN PROYECTO EXISTENTE       ${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo ""

# 1. SOLICITAR RUTAS LOCALES
read -p "Introduce la RUTA LOCAL de tu proyecto activo (Ej: /mnt/c/Users/Andres/DroneGestory): " localProjectPath
localProjectPath=$(echo "$localProjectPath" | sed "s/['\"]//g")

if [ ! -d "$localProjectPath" ]; then
    echo -e "${RED}[ERROR] La ruta del proyecto introducida no existe.${NC}"
    exit 1
fi

read -p "Introduce la RUTA LOCAL donde está el BACKUP a restaurar: " localBackupPath
localBackupPath=$(echo "$localBackupPath" | sed "s/['\"]//g")

if [ ! -d "$localBackupPath" ] || [ ! -f "$localBackupPath/databasecopy.sql" ]; then
    echo -e "${RED}[ERROR] No se encontró el archivo 'databasecopy.sql' en la ruta del backup proporcionada.${NC}"
    exit 1
fi

# Ir al directorio del proyecto
cd "$localProjectPath" || exit 1

# 2. RESPALDO PREVIO DE LO QUE TIENE EL PROYECTO ACTUALMENTE
echo -e "\n${YELLOW}[?] RESPALDO LOCAL PREVIO:${NC}"
read -p "Quieres guardar la base de datos y uploads actuales del proyecto antes de sobrescribir? (S/N): " backupConfirm

if [[ "$backupConfirm" =~ ^[sS]$ ]]; then
    BACKUP_DIR="./database-pre-backup"
    echo -e "\n${YELLOW}[+] Creando carpeta de respaldo previo en: $BACKUP_DIR...${NC}"
    mkdir -p "$BACKUP_DIR"

    echo -e "${YELLOW}[+] Generando pre-backup.sql de la base de datos local actual...${NC}"
    docker exec -t aeronaves_db pg_dump -U admin aeronaves_db > "$BACKUP_DIR/pre-backup.sql"

    if [ -d "./backend/uploads" ]; then
        echo -e "${YELLOW}[+] Copiando carpeta 'uploads' actual al respaldo...${NC}"
        cp -r "./backend/uploads" "$BACKUP_DIR/"
        echo -e "${GREEN}[✓] Respaldo previo creado con éxito.${NC}"
    else
        echo -e "${ORANGE}[!] No se encontró la carpeta './backend/uploads' para respaldar.${NC}"
    fi
else
    echo -e "\n${ORANGE}[-] Se omitió el respaldo previo de los datos locales.${NC}"
fi

# 3. IMPORTAR ARGUMENTOS DEL BACKUP LOCAL AL PROYECTO
echo -e "\n${YELLOW}[+] Copiando archivos del backup local hacia la estructura del proyecto...${NC}"
mkdir -p ./backend/uploads

# Copiar el SQL al directorio raíz del proyecto para la restauración
cp "$localBackupPath/databasecopy.sql" "./"

# Copiar los archivos multimedia si existen en la carpeta del backup
if [ -d "$localBackupPath/uploads" ]; then
    cp -r "$localBackupPath/uploads/." "./backend/uploads/"
fi

# 4. LIMPIAR BASE DE DATOS LOCAL
echo -e "\n${RED}ATENCION: Se va a proceder a BORRAR la base de datos local 'aeronaves_db'...${NC}"
read -p "Deseas continuar con la restauración? (S/N): " confirm
if [[ ! "$confirm" =~ ^[sS]$ ]]; then
    echo -e "${ORANGE}Operacion cancelada por el usuario.${NC}"
    exit 0
fi

echo -e "\n${YELLOW}[+] Vaciando esquema 'public' en la base de datos local...${NC}"
docker exec -i aeronaves_db psql -U admin -d aeronaves_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 5. RESTAURAR DATOS EN LOCAL
echo -e "\n${YELLOW}[+] Importando el archivo SQL local en la base de datos...${NC}"
docker exec -i aeronaves_db psql -U admin -d aeronaves_db < "./databasecopy.sql"

# Limpiamos el temporal que copiamos en la raíz del proyecto
rm ./databasecopy.sql

# 6. ARREGLAR CARACTERES EXTRAÑOS
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
UPDATE user_certificate
SET la_columna_de_la_ruta = REPLACE(la_columna_de_la_ruta, ',', ' ') 
WHERE la_columna_de_la_ruta LIKE '%,%';
"

echo -e "\n${GREEN}PROCESO DE RESTAURACIÓN LOCAL COMPLETADO CON EXITO.${NC}"