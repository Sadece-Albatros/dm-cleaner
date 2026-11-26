@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

if not exist node_modules (
  echo Moduller kuruluyor...
  call npm.cmd install
  if errorlevel 1 (
    echo Kurulum basarisiz.
    pause
    exit /b 1
  )
)

set /p "Token=Token: "
set /p "Id=ID: "
set /p "Backup=Backup (true/false) [true]: "
if "!Backup!"=="" set "Backup=true"
if /I not "!Backup!"=="true" if /I not "!Backup!"=="false" set "Backup=true"

set "TOKEN=!Token!"
set "ID=!Id!"
set "BACKUP=!Backup!"

echo.
call npm.cmd start
echo.
pause
