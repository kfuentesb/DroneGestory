#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$SCRIPT_DIR}"
BACKUP_SCRIPT="$PROJECT_DIR/monthly_backup.sh"
LOG_FILE="$PROJECT_DIR/backups/monthly_backup.log"
CRON_LINE="0 2 1 * * cd \"$PROJECT_DIR\" && \"$BACKUP_SCRIPT\" >> \"$LOG_FILE\" 2>&1"

if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "[ERROR] No existe el script de backup: $BACKUP_SCRIPT"
    exit 1
fi

chmod +x "$BACKUP_SCRIPT"
mkdir -p "$PROJECT_DIR/backups"

if crontab -l 2>/dev/null | grep -F "$BACKUP_SCRIPT" >/dev/null 2>&1; then
    echo "[OK] Ya existe una entrada cron para $BACKUP_SCRIPT"
    exit 0
fi

(crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -

echo "[OK] Backup mensual instalado en cron:"
echo "$CRON_LINE"
