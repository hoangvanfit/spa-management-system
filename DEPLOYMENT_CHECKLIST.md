# ✅ CHECKLIST DEPLOY DỰ ÁN SPA

## 🔧 Chuẩn bị Code

### Backend (Laravel)
- [ ] Tạo file `.env.production`
- [ ] Tạo `Dockerfile`
- [ ] Tạo `docker/apache.conf`
- [ ] Tạo `railway.json`
- [ ] Cập nhật `config/cors.php`
- [ ] Push code lên GitHub

### Frontend (React)
- [ ] Cập nhật `src/admin/config/appConfig.jsx`
- [ ] Tạo `.env.production`
- [ ] Tạo `vercel.json`
- [ ] Push code lên GitHub

## 🚀 Deploy Backend (Railway)

### 1. Tạo Project
- [ ] Đăng ký Railway: https://railway.app
- [ ] Tạo project mới
- [ ] Connect GitHub repository
- [ ] Chọn branch main

### 2. Thêm Database
- [ ] Add Service → Database → MySQL
- [ ] Đợi database khởi tạo xong

### 3. Cấu hình Environment Variables
```
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

### 4. Deploy & Migration
- [ ] Deploy thành công
- [ ] Chạy migration: `php artisan migrate --force`
- [ ] Chạy seeder: `php artisan db:seed --force`
- [ ] Lấy URL backend

## 🌐 Deploy Frontend (Vercel)

### 1. Tạo Project
- [ ] Đăng ký Vercel: https://vercel.com
- [ ] Import GitHub repository
- [ ] Chọn folder `react-frontend`

### 2. Build Settings
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. Environment Variables
```
VITE_API_BASE_URL=https://your-backend.up.railway.app/api/v0.0.1/admin
VITE_API_AUTH_URL=https://your-backend.up.railway.app/api/auth
VITE_API_AUTH_CUSTOMER_URL=https://your-backend.up.railway.app/api/authCustomer
VITE_API_AUTH_URL2=https://your-backend.up.railway.app/api
VITE_API_AUTH_URL3=https://your-backend.up.railway.app/api/v0.0.1/client
VITE_URL_IMAGE=https://your-backend.up.railway.app/storage/uploads
VITE_URL_IMAGE_2=https://your-backend.up.railway.app/storage
```

### 4. Deploy
- [ ] Deploy thành công
- [ ] Lấy URL frontend

## 🔄 Cập nhật Cross-References

### Backend
- [ ] Cập nhật `FRONTEND_URL` trong Railway
- [ ] Redeploy backend

### Frontend
- [ ] Verify tất cả API URLs đúng
- [ ] Test login/register
- [ ] Test các chức năng chính

## 🧪 Testing

### Backend API
- [ ] GET `/api/v0.0.1/admin/users` (cần auth)
- [ ] POST `/api/authCustomer/login`
- [ ] GET `/api/v0.0.1/client/services`

### Frontend
- [ ] Trang chủ load được
- [ ] Login admin: admin@gmail.com / admin123456
- [ ] Login customer: customer@gmail.com / admin123456
- [ ] Đặt lịch hẹn
- [ ] Video call (nếu có)

## 📱 URLs Cuối Cùng

```
Backend API: https://your-backend.up.railway.app
Frontend: https://your-frontend.vercel.app

Admin Panel: https://your-frontend.vercel.app/admin
Client Portal: https://your-frontend.vercel.app
```

## 🆘 Troubleshooting

### Backend Issues
- **500 Error**: Kiểm tra logs trong Railway
- **Database Error**: Verify MySQL connection
- **CORS Error**: Cập nhật FRONTEND_URL

### Frontend Issues
- **Build Failed**: Kiểm tra dependencies
- **API Error**: Verify environment variables
- **Routing Error**: Kiểm tra vercel.json

### Common Fixes
```bash
# Reset database
php artisan migrate:fresh --seed --force

# Clear cache
php artisan config:clear
php artisan cache:clear

# Rebuild frontend
npm run build
```

## 💡 Tips

1. **Free Tier Limitations**:
   - Railway: 500 hours/month
   - Vercel: Unlimited static hosting
   - Database có thể sleep khi không dùng

2. **Monitoring**:
   - Railway Dashboard cho backend logs
   - Vercel Analytics cho frontend performance

3. **Updates**:
   - Push code → Auto deploy
   - Environment variables → Manual redeploy

4. **Backup**:
   - Export database thường xuyên
   - Keep code in GitHub