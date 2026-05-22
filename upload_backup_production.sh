#!/bin/bash

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m' 

echo -e "${RED}==========================================================${NC}"
echo -e "${RED}    ¡PELIGRO! RESTAURAR BACKUP LOCAL EN SERVIDOR REMOTO   ${NC}"
echo -e "${RED}==========================================================${NC}"
echo ""

# 1. SOLICITAR RUTAS Y DATOS DE CONEXIÓN
read -p "Introduce la RUTA LOCAL donde tienes el BACKUP a subir: " localBackupPath
localBackupPath=$(echo "$localBackupPath" | sed "s/['\"]//g")

if [ ! -d "$localBackupPath" ] || [ ! -f "$localBackupPath/databasecopy.sql" ]; then
    echo -e "${RED}[ERROR] No se encontró 'databasecopy.sql' en la ruta proporcionada.${NC}"
    exit 1
fi

read -p "Introduce la IP del servidor de Produccion (destino): " serverIP

read -p "Introduce el usuario SSH [root]: " serverUser
if [ -z "$serverUser" ]; then
    serverUser="root"
fi

# 2. DOBLE CONFIRMACIÓN DE SEGURIDAD
echo -e "\n${RED}¡ADVERTENCIA CRÍTICA!${NC}"
echo -e "${ORANGE}Este proceso BORRARÁ POR COMPLETO la base de datos actual del servidor remoto ($serverIP)${NC}"
echo -e "${ORANGE}y reemplazará las imágenes/archivos de producción por tus archivos locales.${NC}"
echo ""
read -p "¿Estás ABSOLUTAMENTE seguro de que quieres continuar? (S/N): " confirm1
if [[ ! "$confirm1" =~ ^[sS]$ ]]; then
    echo -e "${GREEN}Operación cancelada de forma segura.${NC}"
    exit 0
fi

echo -e "\n${RED}[!] SEGUNDA CONFIRMACIÓN DE SEGURIDAD [!]${NC}"
read -p "Escribe la palabra 'PRODUCCION' en mayúsculas para proceder: " confirm2
if [ "$confirm2" != "PRODUCCION" ]; then
    echo -e "${GREEN}Validación incorrecta. Operación abortada.${NC}"
    exit 0
fi

# 3. SUBIR ARCHIVOS AL SERVIDOR (SCP)
echo -e "\n${YELLOW}[+] Subiendo archivo SQL al servidor remoto...${NC}"
scp "$localBackupPath/databasecopy.sql" "${serverUser}@${serverIP}:/home/DroneGestory/"

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Falló la subida del archivo SQL por SCP.${NC}"
    exit 1
fi

if [ -d "$localBackupPath/uploads" ]; then
    echo -e "\n${YELLOW}[+] Subiendo carpeta 'uploads' al servidor remoto...${NC}"
    # El punto al final de /uploads/. asegura que se copie el contenido dentro del destino
    scp -r "$localBackupPath/uploads/." "${serverUser}@${serverIP}:/home/DroneGestory/backend/uploads/"
else
    echo -e "\n${ORANGE}[!] No se detectó carpeta 'uploads' local. Solo se actualizará la Base de Datos.${NC}"
fi

# 4. EJECUTAR RESTAURACIÓN REMOTA POR SSH
echo -e "\n${YELLOW}[+] Conectando vía SSH para aplicar los cambios en el servidor...${NC}"

ssh "${serverUser}@${serverIP}" "
    echo -e '${YELLOW}[+] Entrando al directorio del proyecto...${NC}'
    cd /home/DroneGestory || exit 1

    echo -e '${YELLOW}[+] Vaciando esquema public de la base de datos de producción...${NC}'
    docker exec -i dronegestory-db psql -U admin -d aeronaves_db -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

    echo -e '${YELLOW}[+] Inyectando el nuevo archivo SQL en el contenedor remoto...${NC}'
    docker exec -i dronegestory-db psql -U admin -d aeronaves_db < ./databasecopy.sql

    echo -e '${YELLOW}[+] Limpiando archivo SQL temporal del servidor...${NC}'
    rm ./databasecopy.sql
"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}[✓] ¡ÉXITO! El servidor de producción ha sido restaurado y actualizado correctamente.${NC}"
else
    echo -e "\n${RED}[ERROR] El proceso de inyección de datos falló en el servidor remoto.${NC}"
    exit 1
fi