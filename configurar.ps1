$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
Write-Host 'AgroControl: configura los valores DB_* y SESSION_SECRET del archivo .env.' -ForegroundColor Cyan
Write-Host 'Asegúrate de tener MySQL 8 iniciado y una base de datos agrocontrol creada.'
Write-Host 'Luego ejecuta npm install y npm run setup; el asistente creará el usuario administrador.'
if (-not (Test-Path 'node_modules')) { npm install }
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias.' }
Write-Host 'Configuración de dependencias completada. Ejecuta npm run setup.' -ForegroundColor Green
