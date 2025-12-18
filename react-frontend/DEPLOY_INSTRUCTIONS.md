# 🚀 HƯỚNG DẪN DEPLOY FRONTEND LÊN VERCEL

## Bước 1: Chuẩn bị

1. **Đăng ký Vercel**: https://vercel.com
2. **Connect GitHub**: Authorize Vercel access
3. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

## Bước 2: Deploy từ GitHub

1. **Vào Vercel Dashboard**
2. **Click "New Project"**
3. **Import từ GitHub repository**
4. **Chọn folder "react-frontend"**

## Bước 3: Cấu hình Build Settings

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Bước 4: Cấu hình Environment Variables

Thêm các biến sau trong Vercel:

```
VITE_API_BASE_URL=https://your-backend-url.up.railway.app/api/v0.0.1/admin
VITE_API_AUTH_URL=https://your-backend-url.up.railway.app/api/auth
VITE_API_AUTH_CUSTOMER_URL=https://your-backend-url.up.railway.app/api/authCustomer
VITE_API_AUTH_URL2=https://your-backend-url.up.railway.app/api
VITE_API_AUTH_URL3=https://your-backend-url.up.railway.app/api/v0.0.1/client
VITE_URL_IMAGE=https://your-backend-url.up.railway.app/storage/uploads
VITE_URL_IMAGE_2=https://your-backend-url.up.railway.app/storage
VITE_PUSHER_APP_KEY=805e0126a94c147b5dbb
VITE_PUSHER_APP_CLUSTER=ap1
VITE_PUSHER_HOST=
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
```

## Bước 5: Deploy

1. **Click "Deploy"**
2. **Đợi build hoàn thành**
3. **Lấy URL** (dạng: https://your-app.vercel.app)

## Bước 6: Cập nhật Backend CORS

1. **Vào Railway Dashboard**
2. **Cập nhật biến FRONTEND_URL**:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

## ⚠️ LƯU Ý

1. **Mỗi lần push code** → Vercel tự động redeploy
2. **Kiểm tra build logs** nếu có lỗi
3. **Domain custom** có thể thêm trong Settings

## 🔧 Troubleshooting

### Build Failed:
- Kiểm tra dependencies trong package.json
- Xem build logs chi tiết

### API Connection Error:
- Kiểm tra CORS settings
- Verify environment variables
- Test API endpoints