# Script tự động cập nhật URLs sau khi deploy
param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$FrontendUrl
)

Write-Host "🚀 Cập nhật URLs deployment..." -ForegroundColor Green

# Cập nhật VERCEL_ENV_VARIABLES.txt
Write-Host "📝 Cập nhật Vercel environment variables..." -ForegroundColor Yellow

$vercelContent = @"
Copy và paste các biến này vào Vercel Environment Variables:

VITE_API_BASE_URL=$BackendUrl/api/v0.0.1/admin
VITE_API_AUTH_URL=$BackendUrl/api/auth
VITE_API_AUTH_CUSTOMER_URL=$BackendUrl/api/authCustomer
VITE_API_AUTH_URL2=$BackendUrl/api
VITE_API_AUTH_URL3=$BackendUrl/api/v0.0.1/client
VITE_URL_IMAGE=$BackendUrl/storage/uploads
VITE_URL_IMAGE_2=$BackendUrl/storage
VITE_PUSHER_APP_KEY=805e0126a94c147b5dbb
VITE_PUSHER_APP_CLUSTER=ap1
VITE_PUSHER_HOST=
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
"@

$vercelContent | Out-File -FilePath "VERCEL_ENV_VARIABLES.txt" -Encoding UTF8

# Cập nhật RAILWAY_ENV_VARIABLES.txt
Write-Host "📝 Cập nhật Railway environment variables..." -ForegroundColor Yellow

$railwayContent = Get-Content "RAILWAY_ENV_VARIABLES.txt" -Raw
$railwayContent = $railwayContent -replace "FRONTEND_URL=.*", "FRONTEND_URL=$FrontendUrl"
$railwayContent | Out-File -FilePath "RAILWAY_ENV_VARIABLES.txt" -Encoding UTF8

# Cập nhật .env.production files
Write-Host "📝 Cập nhật production environment files..." -ForegroundColor Yellow

# Backend .env.production
$backendEnvContent = Get-Content "laravel-backend/.env.production" -Raw
$backendEnvContent = $backendEnvContent -replace "APP_URL=.*", "APP_URL=$BackendUrl"
$backendEnvContent = $backendEnvContent -replace "FRONTEND_URL=.*", "FRONTEND_URL=$FrontendUrl"
$backendEnvContent | Out-File -FilePath "laravel-backend/.env.production" -Encoding UTF8

# Frontend .env.production  
$frontendEnvContent = @"
# Production Environment Variables
VITE_API_BASE_URL=$BackendUrl/api/v0.0.1/admin
VITE_API_AUTH_URL=$BackendUrl/api/auth
VITE_API_AUTH_CUSTOMER_URL=$BackendUrl/api/authCustomer
VITE_API_AUTH_URL2=$BackendUrl/api
VITE_API_AUTH_URL3=$BackendUrl/api/v0.0.1/client
VITE_URL_IMAGE=$BackendUrl/storage/uploads
VITE_URL_IMAGE_2=$BackendUrl/storage

# Pusher (Video Call)
VITE_PUSHER_APP_KEY=805e0126a94c147b5dbb
VITE_PUSHER_APP_CLUSTER=ap1
VITE_PUSHER_HOST=
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
"@

$frontendEnvContent | Out-File -FilePath "react-frontend/.env.production" -Encoding UTF8

Write-Host "✅ Hoàn thành cập nhật URLs!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Thông tin deployment:" -ForegroundColor Cyan
Write-Host "Backend URL: $BackendUrl" -ForegroundColor White
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Bước tiếp theo:" -ForegroundColor Yellow
Write-Host "1. Cập nhật environment variables trong Railway với FRONTEND_URL mới"
Write-Host "2. Cập nhật environment variables trong Vercel với backend URLs mới"
Write-Host "3. Redeploy cả hai services"
Write-Host "4. Chạy migration: php artisan migrate:fresh --seed --force"

# Hiển thị commands để copy
Write-Host ""
Write-Host "📋 Commands để test:" -ForegroundColor Magenta
Write-Host "curl $BackendUrl/api/v0.0.1/client/services" -ForegroundColor Gray
Write-Host "curl $FrontendUrl" -ForegroundColor Gray