#!/bin/bash

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m' 

echo -e "${CYAN}==========================================================${NC}"
echo -e "${CYAN}        DESCARGAR COPIA DE SEGURIDAD DESDE PRODUCCIÓN     ${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo ""

# 1. SOLICITAR DATOS DE CONEXIÓN Y DESTINO
read -p "Introduce la IP del servidor de Produccion (Ej: 213.165.78.203): " serverIP

read -p "Introduce el usuario SSH [root]: " serverUser
if [ -z "$serverUser" ]; then
    serverUser="root"
fi

read -p "Introduce la CARPETA LOCAL donde quieres guardar el Backup (Ej: /mnt/c/Users/Andres/BackupsDrone): " backupDestPath
backupDestPath=$(echo "$backupDestPath" | sed "s/['\"]//g")

# Crear la carpeta de destino absoluta si no existe
mkdir -p "$backupDestPath"

# 2. EJECUTAR EL DUMP EN EL SERVIDOR REMOTO
echo -e "\n${YELLOW}[+] Conectando al servidor remoto para generar el volcado SQL...${NC}"
echo -e "${ORANGE}Introduce la contrasena de tu servidor si el sistema te la solicita.${NC}"

ssh "${serverUser}@${serverIP}" "cd /home/DroneGestory && docker exec -t dronegestory-db pg_dump -U admin aeronaves_db > databasecopy.sql"

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Error al generar el archivo SQL en el servidor remoto.${NC}"
    exit 1
fi

# 3. DESCARGAR LOS ARCHIVOS UTILIZANDO LA RUTA ABSOLUTA PROPORCIONADA
echo -e "\n${YELLOW}[+] Descargando archivo SQL a la ruta destino...${NC}"
scp "${serverUser}@${serverIP}:/home/DroneGestory/databasecopy.sql" "$backupDestPath/databasecopy.sql"

echo -e "\n${YELLOW}[+] Descargando carpeta /uploads a la ruta destino...${NC}"
# Aseguramos que la carpeta contenedora exista en local
mkdir -p "$backupDestPath"

# CORRECCIÓN DE SCP: Apuntamos directamente a la carpeta remota 'uploads' 
# y dejamos que SCP la descargue entera de forma recursiva dentro de nuestro destino.
scp -r "${serverUser}@${serverIP}:/home/DroneGestory/backend/uploads" "$backupDestPath/"

# 4. VERIFICACIÓN DE SEGURIDAD LOCAL
if [ -d "$backupDestPath/uploads" ] && [ "$(ls -A "$backupDestPath/uploads" 2>/dev/null)" ]; then
    echo -e "${GREEN}[✓] Carpeta uploads descargada correctamente con archivos.${NC}"
else
    echo -e "${RED}[ALERTA] La carpeta 'uploads' local está vacía o no se descargó.${NC}"
    echo -e "${ORANGE}[i] Comprobando si la ruta existe en el servidor remoto...${NC}"
    # Esto te dirá si la ruta en el servidor realmente existe y si tiene archivos dentro
    ssh "${serverUser}@${serverIP}" "if [ -d /home/DroneGestory/backend/uploads ]; then echo '-> La ruta SI existe en el servidor. Archivos encontrados:'; ls -A /home/DroneGestory/backend/uploads | wc -l; else echo '-> [¡!] La ruta /home/DroneGestory/backend/uploads NO existe en el servidor remoto.'; fi"
fi

# 5. LIMPIEZA EN EL SERVIDOR REMOTO
echo -e "\n${YELLOW}[+] Limpiando el archivo temporal en el servidor remoto...${NC}"
ssh "${serverUser}@${serverIP}" "rm /home/DroneGestory/databasecopy.sql"

echo -e "\n${GREEN}[✓] PROCESO FINALIZADO EN: $backupDestPath${NC}"