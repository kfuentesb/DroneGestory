#!/bin/bash
set -euo pipefail

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$SCRIPT_DIR}"
BACKUPS_ROOT="${BACKUPS_ROOT:-$PROJECT_DIR/backups}"
BACKUP_DATE="$(date +%Y-%m-%d)"
BACKUP_DIR="$BACKUPS_ROOT/$BACKUP_DATE"
SQL_FILE="$BACKUP_DIR/postgredatabase.sql"
DB_CONTAINER="${DB_CONTAINER:-dronegestory-db}"
UPLOADS_SOURCE="${UPLOADS_SOURCE:-$PROJECT_DIR/backend/uploads}"
AUDIT_LOGS_SOURCE="${AUDIT_LOGS_SOURCE:-$PROJECT_DIR/backend/AuditLogs}"

echo -e "${CYAN}==========================================================${NC}"
echo -e "${CYAN}             BACKUP MENSUAL DRONEGESTORY                 ${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo ""

cd "$PROJECT_DIR"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$PROJECT_DIR/.env"
    set +a
fi

DB_USER="${DB_USER:-admin}"
DB_NAME="${DB_NAME:-aeronaves_db}"

mkdir -p "$BACKUP_DIR/backend"

echo -e "${YELLOW}[+] Generando volcado PostgreSQL en: $SQL_FILE${NC}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$SQL_FILE"

if [ ! -s "$SQL_FILE" ]; then
    echo -e "${RED}[ERROR] El volcado SQL se ha creado vacio.${NC}"
    exit 1
fi

copy_directory() {
    local source_dir="$1"
    local destination_dir="$2"
    local label="$3"

    if [ ! -d "$source_dir" ]; then
        echo -e "${ORANGE}[!] No existe $label en: $source_dir. Se omite.${NC}"
        return 0
    fi

    echo -e "${YELLOW}[+] Copiando $label a: $destination_dir${NC}"
    mkdir -p "$destination_dir"

    if command -v rsync >/dev/null 2>&1; then
        rsync -a --delete "$source_dir/" "$destination_dir/"
    else
        rm -rf "$destination_dir"
        cp -a "$source_dir" "$destination_dir"
    fi
}

copy_directory "$UPLOADS_SOURCE" "$BACKUP_DIR/backend/uploads" "backend/uploads"
copy_directory "$AUDIT_LOGS_SOURCE" "$BACKUP_DIR/backend/AuditLogs" "backend/AuditLogs"

echo -e "${GREEN}[OK] Backup mensual completado en: $BACKUP_DIR${NC}"
