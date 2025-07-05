@echo off
echo ===== DIAGNOSTIC TEMPO/HOME =====
echo.

echo Test Backend (port 8888)...
curl -s -o nul -w "%%{http_code}" http://localhost:8888/api/maisons > temp_result.txt
set /p backend_status=<temp_result.txt
if "%backend_status%"=="200" (
    echo ✓ Backend: OK ^(Status: %backend_status%^)
) else (
    echo ✗ Backend: Erreur ^(Status: %backend_status%^)
)

echo.
echo Test Frontend (port 5173)...
curl -s -o nul -w "%%{http_code}" http://localhost:5173 > temp_result.txt
set /p frontend_status=<temp_result.txt
if "%frontend_status%"=="200" (
    echo ✓ Frontend: OK ^(Status: %frontend_status%^)
) else (
    echo ✗ Frontend: Erreur ^(Status: %frontend_status%^)
)

echo.
echo Test Proxy Vite...
curl -s -o nul -w "%%{http_code}" http://localhost:5173/api/maisons > temp_result.txt
set /p proxy_status=<temp_result.txt
if "%proxy_status%"=="200" (
    echo ✓ Proxy: OK ^(Status: %proxy_status%^)
) else (
    echo ✗ Proxy: Erreur ^(Status: %proxy_status%^)
)

del temp_result.txt 2>nul

echo.
echo ===== URLS =====
echo 🌐 Application: http://localhost:5173
echo 🔧 API Backend: http://localhost:8888
echo 📊 Test API: http://localhost:8888/api/maisons
echo.
