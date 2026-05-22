# 1. SOLICITAR DATOS AL USUARIO
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SISTEMA DE COPIAS DE SEGURIDAD - DRONE GESTORY" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$localProjectPath = Read-Host "Introduce la RUTA LOCAL de tu proyecto (Ej: C:\Users\Dell\Documents\Cosas Andres\DroneGestory)"
$localProjectPath = $localProjectPath.Trim('"').Trim("'")

$serverIP = Read-Host "Introduce la IP del servidor de Produccion (Ej: 213.165.78.203)"

$serverUser = Read-Host "Introduce el usuario SSH [root]"
if ([string]::IsNullOrEmpty($serverUser)) { $serverUser = "root" }

Write-Host "`n[+] Validando rutas locales..." -ForegroundColor Yellow
if (-not (Test-Path $localProjectPath)) {
    Write-Error "La ruta local introducida no existe. Por favor, verifica la ruta."
    Exit
}

Set-Location -Path $localProjectPath

# 2. EJECUTAR EL DUMP EN EL SERVIDOR REMOTO
Write-Host "`n[+] Conectando al servidor remoto para generar el volcado SQL..." -ForegroundColor Yellow
Write-Host "⚠️  Introduce la contrasena de tu servidor si el sistema te la solicita." -ForegroundColor DarkYellow

ssh "${serverUser}@${serverIP}" "cd /home/DroneGestory && docker exec -t dronegestory-db pg_dump -U admin aeronaves_db > databasecopy.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al generar el archivo SQL en el servidor remoto."
    Exit
}

# 3. DESCARGAR LOS ARCHIVOS (SCP)
Write-Host "`n[+] Descargando archivo SQL desde produccion..." -ForegroundColor Yellow
scp "${serverUser}@${serverIP}:/home/DroneGestory/databasecopy.sql" $localProjectPath

Write-Host "`n[+] Descargando carpeta /uploads desde produccion..." -ForegroundColor Yellow
scp -r "${serverUser}@${serverIP}:/home/DroneGestory/backend/uploads" $localProjectPath

# 4. LIMPIAR BASE DE DATOS LOCAL
Write-Host "`n[🚨] ATENCION: Se va a proceder a BORRAR la base de datos local 'aeronaves_db'..." -ForegroundColor Red
$confirm = Read-Host "Deas continuar? (S/N)"
if ($confirm -notmatch "^[sS]") {
    Write-Host "❌ Operacion cancelada por el usuario." -ForegroundColor Orange
    Exit
}

Write-Host "`n[+] Vaciando esquema 'public' en la base de datos local..." -ForegroundColor Yellow
docker exec -i aeronaves_db psql -U admin -d aeronaves_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 5. RESTAURAR DATOS EN LOCAL
Write-Host "`n[+] Importando el nuevo archivo SQL en la base de datos local..." -ForegroundColor Yellow
Get-Content -Raw -Path ".\databasecopy.sql" | docker exec -i aeronaves_db psql -U admin -d aeronaves_db

# 6. ARREGLAR CARACTERES EXTRAÑOS EN WINDOWS
Write-Host "`n[+] Normalizando nombres de carpetas en Windows (Reemplazando ',' por ' ')..." -ForegroundColor Yellow

if (Test-Path ".\uploads") {
    Get-ChildItem -Path ".\uploads" -Recurse -Directory | Where-Object {$_.Name -match ','} | ForEach-Object {
        $newName = $_.Name -replace ',', ' '
        Write-Host "   -> Renombrando: $($_.Name) a: $newName" -ForegroundColor Gray
        Rename-Item -Path $_.FullName -NewName $newName
    }
} else {
    Write-Host "⚠️  No se encontro la carpeta 'uploads' local para normalizar." -ForegroundColor DarkYellow
}

Write-Host "`n✅ PROCESO COMPLETADO CON EXITO." -ForegroundColor Green
Write-Host "Tu entorno local ya tiene la copia exacta de produccion." -ForegroundColor Green