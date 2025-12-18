@echo off
echo ========================================
echo   QUICK UPDATE BACKEND URL SCRIPT
echo ========================================
echo.
echo Nhap URL backend tu Railway (vi du: https://web-production-1234.up.railway.app):
set /p BACKEND_URL=

echo.
echo Dang cap nhat file .env.production...

powershell -Command "(Get-Content 'react-frontend\.env.production') -replace 'https://spa-backend-production\.up\.railway\.app', '%BACKEND_URL%' | Set-Content 'react-frontend\.env.production'"

echo.
echo Dang commit va push...
git add .
git commit -m "Update backend URL to %BACKEND_URL%"
git push

echo.
echo ========================================
echo   HOAN THANH! 
echo   Backend URL da duoc cap nhat thanh: %BACKEND_URL%
echo ========================================
pause