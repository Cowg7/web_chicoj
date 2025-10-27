@echo off
echo ========================================
echo   REINICIAR BACKEND CON NUEVA CONFIG
echo ========================================
echo.
echo Presiona Ctrl+C en la terminal del backend actual
echo y luego ejecuta este script.
echo.
pause

cd backend
echo.
echo Iniciando backend con nueva configuracion CORS...
echo.
npm run dev

