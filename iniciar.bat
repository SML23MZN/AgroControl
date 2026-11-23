@echo off
cd /d "%~dp0"
if not exist .env (
  echo Primero copia .env.example a .env, configura MySQL y ejecuta configurar.ps1.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias...
  call npm.cmd install
  if errorlevel 1 ( pause & exit /b 1 )
)
if not exist dist\index.html (
  echo Preparando la interfaz web...
  call npm.cmd run build
  if errorlevel 1 ( pause & exit /b 1 )
)
echo Abriendo AgroControl en http://localhost:3080
call npm.cmd start
pause
