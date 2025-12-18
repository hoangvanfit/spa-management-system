# Script để cập nhật Backend URL
# Cách dùng: Thay YOUR_RAILWAY_URL bằng URL thực tế

$BACKEND_URL = "YOUR_RAILWAY_URL"  # VD: https://web-production-abc123.up.railway.app

Write-Host "Dang cap nhat Backend URL thanh: $BACKEND_URL" -ForegroundColor Green

# Đọc file
$content = Get-Content "react-frontend\.env.production" -Raw

# Thay thế URL
$content = $content -replace "https://spa-backend-production\.up\.railway\.app", $BACKEND_URL

# Ghi lại file
Set-Content "react-frontend\.env.production" -Value $content

Write-Host "Da cap nhat xong!" -ForegroundColor Green
Write-Host "Kiem tra file: react-frontend\.env.production" -ForegroundColor Yellow