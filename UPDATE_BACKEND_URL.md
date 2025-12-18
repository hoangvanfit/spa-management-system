# CẬP NHẬT BACKEND URL

Sau khi có URL backend từ Railway, bạn cần:

1. **Lấy URL từ Railway** (ví dụ: https://spa-backend-production-abc123.up.railway.app)

2. **Cập nhật file .env.production:**
   - Thay thế tất cả `spa-backend-production.up.railway.app` 
   - Bằng URL thực tế từ Railway

3. **Commit và push:**
   ```bash
   git add .
   git commit -m "Update real backend URL"
   git push
   ```

**VÍ DỤ:**
Nếu Railway URL là: `https://web-production-1234.up.railway.app`

Thì cập nhật:
```
VITE_API_BASE_URL=https://web-production-1234.up.railway.app/api/v0.0.1/admin
VITE_API_AUTH_URL=https://web-production-1234.up.railway.app/api/auth
...
```