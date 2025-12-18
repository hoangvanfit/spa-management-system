# 🚀 HƯỚNG DẪN DEPLOY TỰ ĐỘNG

## 📋 Checklist Trước Khi Deploy

✅ Code đã được push lên GitHub: `git@github.com:hoangvanfit/spa-management-system.git`
✅ Dockerfile có sẵn
✅ railway.json có sẵn  
✅ vercel.json có sẵn
✅ Environment files có sẵn

## 🔗 LINKS DEPLOY

### 1. Deploy Backend (Railway)
👉 **Truy cập**: https://railway.app
👉 **Tạo project mới** → **Deploy from GitHub repo**
👉 **Chọn repo**: `hoangvanfit/spa-management-system`
👉 **Root Directory**: `laravel-backend`

### 2. Deploy Frontend (Vercel)  
👉 **Truy cập**: https://vercel.com
👉 **New Project** → **Import from GitHub**
👉 **Chọn repo**: `hoangvanfit/spa-management-system`
👉 **Root Directory**: `react-frontend`

## ⚙️ CẤU HÌNH TỰ ĐỘNG

### Railway Environment Variables
```bash
# Copy từ file RAILWAY_ENV_VARIABLES.txt
APP_NAME=SPA Management System
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:C+BDudosragvh+A16K8Ci+dY8AdEePcuUax93naCmQs=

DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

JWT_SECRET=oNNkNF2XcDO88Zp6xIaqzYNe78QHdNiIUMrEw9eCQ2IPP2NtoXeWu126qyHSia1P

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=iamduc7890@gmail.com
MAIL_PASSWORD=cnki qvjz zkwy qrfi
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=iamduc7890@gmail.com

PUSHER_APP_ID=2078376
PUSHER_APP_KEY=805e0126a94c147b5dbb
PUSHER_APP_SECRET=1a1d83a80d95ba0ec447
PUSHER_APP_CLUSTER=ap1

FRONTEND_URL=https://your-frontend.vercel.app
```

### Vercel Environment Variables
```bash
# Thay YOUR-BACKEND-URL bằng URL từ Railway
VITE_API_BASE_URL=https://YOUR-BACKEND-URL.up.railway.app/api/v0.0.1/admin
VITE_API_AUTH_URL=https://YOUR-BACKEND-URL.up.railway.app/api/auth
VITE_API_AUTH_CUSTOMER_URL=https://YOUR-BACKEND-URL.up.railway.app/api/authCustomer
VITE_API_AUTH_URL2=https://YOUR-BACKEND-URL.up.railway.app/api
VITE_API_AUTH_URL3=https://YOUR-BACKEND-URL.up.railway.app/api/v0.0.1/client
VITE_URL_IMAGE=https://YOUR-BACKEND-URL.up.railway.app/storage/uploads
VITE_URL_IMAGE_2=https://YOUR-BACKEND-URL.up.railway.app/storage
VITE_PUSHER_APP_KEY=805e0126a94c147b5dbb
VITE_PUSHER_APP_CLUSTER=ap1
```

## 🎯 THỨ TỰ DEPLOY

1. **Deploy Backend trước** (Railway)
2. **Lấy URL backend** 
3. **Cập nhật Vercel environment variables**
4. **Deploy Frontend** (Vercel)
5. **Cập nhật FRONTEND_URL trong Railway**
6. **Chạy migration**: `php artisan migrate:fresh --seed --force`

## 🧪 TEST ACCOUNTS

- **Admin**: admin@gmail.com / admin123456
- **Customer**: customer@gmail.com / admin123456

## 📱 KẾT QUẢ CUỐI CÙNG

- **Backend API**: https://your-backend.up.railway.app
- **Frontend**: https://your-frontend.vercel.app
- **Admin Panel**: https://your-frontend.vercel.app/admin