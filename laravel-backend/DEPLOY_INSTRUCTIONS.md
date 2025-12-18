# 🚀 HƯỚNG DẪN DEPLOY BACKEND LÊN RAILWAY

## Bước 1: Tạo Project trên Railway

1. **Đăng nhập Railway**: https://railway.app
2. **Tạo project mới**: Click "New Project"
3. **Chọn "Deploy from GitHub repo"**
4. **Connect GitHub**: Authorize Railway access
5. **Chọn repository**: Chọn repo chứa code Laravel

## Bước 2: Cấu hình Database

1. **Thêm MySQL Database**:
   - Click "Add Service" → "Database" → "MySQL"
   - Railway sẽ tự động tạo database

2. **Lấy thông tin kết nối**:
   - Vào tab "Variables" của MySQL service
   - Copy các biến: MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD

## Bước 3: Cấu hình Environment Variables

Vào tab "Variables" của Laravel service và thêm:

```
APP_NAME=SPA Management System
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:C+BDudosragvh+A16K8Ci+dY8AdEePcuUax93naCmQs=

# Database (Railway tự động inject)
DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# JWT
JWT_SECRET=oNNkNF2XcDO88Zp6xIaqzYNe78QHdNiIUMrEw9eCQ2IPP2NtoXeWu126qyHSia1P

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=iamduc7890@gmail.com
MAIL_PASSWORD=cnki qvjz zkwy qrfi
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=iamduc7890@gmail.com
MAIL_FROM_NAME=SPA Management System

# Pusher
PUSHER_APP_ID=2078376
PUSHER_APP_KEY=805e0126a94c147b5dbb
PUSHER_APP_SECRET=1a1d83a80d95ba0ec447
PUSHER_APP_CLUSTER=ap1

# Frontend URL (sẽ cập nhật sau)
FRONTEND_URL=https://your-frontend-app.vercel.app
```

## Bước 4: Deploy

1. **Push code lên GitHub**
2. **Railway tự động deploy** khi có commit mới
3. **Kiểm tra logs** trong tab "Deployments"

## Bước 5: Chạy Migration

1. **Vào tab "Settings"** của Laravel service
2. **Scroll xuống "Deploy"**
3. **Thêm vào "Build Command"**: `php artisan migrate --force`

## Bước 6: Lấy URL

1. **Vào tab "Settings"**
2. **Scroll xuống "Networking"**
3. **Click "Generate Domain"**
4. **Copy URL** (dạng: https://your-app-name.up.railway.app)

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Không commit file .env** - Chỉ dùng Variables trên Railway
2. **Kiểm tra logs** nếu deploy fail
3. **Database sẽ mất data** khi restart (free tier)
4. **Backup database** thường xuyên

## 🔧 Troubleshooting

### Lỗi 500 Internal Server Error:
```bash
# Kiểm tra logs trong Railway dashboard
# Thường do thiếu APP_KEY hoặc database connection
```

### Lỗi CORS:
```bash
# Cập nhật FRONTEND_URL trong Variables
# Kiểm tra config/cors.php
```

### Lỗi Migration:
```bash
# Vào Railway console và chạy:
php artisan migrate:fresh --seed --force
```