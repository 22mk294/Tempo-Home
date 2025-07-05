@echo off
echo ===== DEMARRAGE TEMPO/HOME =====
echo.

echo Nettoyage des processus Node.js...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak > nul

echo Demarrage du backend sur port 8888...
start "Backend" cmd /k "node server/index.js"
timeout /t 5 /nobreak > nul

echo Test de l'API backend...
curl http://localhost:8888/api/maisons > nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Backend OK
) else (
    echo ✗ Backend erreur
)

echo Demarrage du frontend sur port 5173...
start "Frontend" cmd /k "npx vite"

echo.
echo ===== PLATEFORME DEMARREE =====
echo Backend: http://localhost:8888
echo Frontend: http://localhost:5173
echo.
pause
