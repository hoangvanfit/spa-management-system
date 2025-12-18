# HƯỚNG DẪN DEBUG LỖI ĐĂNG NHẬP

## Các bước kiểm tra khi không thể đăng nhập:

### 1. Kiểm tra Backend API có đang chạy không

**URL API hiện tại trong code:**
- Admin: `http://127.0.0.1:8000/api/auth/login`
- Client: `http://127.0.0.1:8000/api/authCustomer/login`

**Cách kiểm tra:**
1. Mở trình duyệt hoặc Postman
2. Truy cập: `http://127.0.0.1:8000/api/auth/login` (hoặc URL backend của bạn)
3. Nếu không kết nối được → Backend chưa chạy hoặc URL sai

**Giải pháp:**
- Khởi động backend server (Laravel/PHP)
- Kiểm tra file `src/admin/config/appConfig.jsx` và cập nhật URL nếu cần

---

### 2. Kiểm tra Console Browser (F12)

**Các lỗi thường gặp:**

#### a) CORS Error
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Giải pháp:**
- Cấu hình CORS trong backend (Laravel: `config/cors.php`)
- Thêm middleware CORS cho phép origin frontend

#### b) Network Error / Connection Refused
```
Network Error
ERR_CONNECTION_REFUSED
```

**Giải pháp:**
- Kiểm tra backend có đang chạy không
- Kiểm tra port (8000) có đúng không
- Kiểm tra firewall

#### c) 401 Unauthorized
```
401 Unauthorized
```

**Giải pháp:**
- Kiểm tra email/password có đúng không
- Kiểm tra tài khoản có bị khóa không
- Kiểm tra token có hợp lệ không

#### d) 422 Validation Error
```
422 Unprocessable Entity
```

**Giải pháp:**
- Kiểm tra format email (phải có @ và domain)
- Kiểm tra mật khẩu (tối thiểu 6 ký tự)
- Xem chi tiết lỗi trong response.errors

#### e) 500 Internal Server Error
```
500 Internal Server Error
```

**Giải pháp:**
- Kiểm tra log backend (Laravel: `storage/logs/laravel.log`)
- Kiểm tra database connection
- Kiểm tra cấu hình server

---

### 3. Kiểm tra LocalStorage

**Mở Console (F12) và chạy:**
```javascript
// Kiểm tra token
console.log("Token Admin:", localStorage.getItem("tokenAdmin"));
console.log("Token Client:", localStorage.getItem("tokenClient"));
console.log("User:", localStorage.getItem("user"));
console.log("Role:", localStorage.getItem("role"));
```

**Nếu có token cũ:**
```javascript
// Xóa token cũ và thử lại
localStorage.removeItem("tokenAdmin");
localStorage.removeItem("tokenClient");
localStorage.removeItem("user");
localStorage.removeItem("role");
localStorage.removeItem("idStaff");
```

---

### 4. Kiểm tra Network Tab (F12 → Network)

1. Mở tab Network trong DevTools
2. Thử đăng nhập lại
3. Tìm request đến `/api/auth/login` hoặc `/api/authCustomer/login`
4. Kiểm tra:
   - **Status Code**: 200 (thành công), 401 (sai thông tin), 422 (validation), 500 (server error)
   - **Request Payload**: Email và password có được gửi đúng không
   - **Response**: Xem server trả về gì

---

### 5. Kiểm tra Token sau khi đăng nhập

Sau khi đăng nhập thành công, token sẽ được lưu trong localStorage:
- Admin: `tokenAdmin`
- Client: `tokenClient`

**Kiểm tra token:**
```javascript
const token = localStorage.getItem("tokenAdmin"); // hoặc tokenClient
if (token) {
    console.log("Token:", token);
    // Decode token để xem thông tin
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log("Token payload:", payload);
    console.log("Token expires:", new Date(payload.exp * 1000));
}
```

---

### 6. Các lỗi thường gặp và cách sửa

#### Lỗi: "Không tìm thấy token"
- **Nguyên nhân**: Token không được lưu sau khi đăng nhập
- **Giải pháp**: Kiểm tra response từ API có chứa `access_token` không

#### Lỗi: "Token is expired"
- **Nguyên nhân**: Token đã hết hạn
- **Giải pháp**: Đăng nhập lại để lấy token mới

#### Lỗi: "Invalid token"
- **Nguyên nhân**: Token không đúng format hoặc bị hỏng
- **Giải pháp**: Xóa token cũ và đăng nhập lại

#### Lỗi: "Vui lòng đăng nhập tài khoản"
- **Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn
- **Giải pháp**: Đăng nhập lại

---

### 7. Test API trực tiếp với cURL hoặc Postman

**Test đăng nhập Admin:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Test đăng nhập Client:**
```bash
curl -X POST http://127.0.0.1:8000/api/authCustomer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"password123"}'
```

Nếu API trả về lỗi → Vấn đề ở backend
Nếu API trả về token → Vấn đề ở frontend

---

### 8. Kiểm tra cấu hình trong code

**File: `src/admin/config/appConfig.jsx`**
- Kiểm tra `API_BASE_URL` và các endpoint có đúng không
- URL phải khớp với backend của bạn

**File: `src/admin/config/axiosInstance.jsx`**
- Kiểm tra interceptors có hoạt động không
- Kiểm tra CSRF token có được gửi không

---

### 9. Debug trong code

Đã thêm console.log vào các file login để debug:
- `src/client/modules/Login/components/Login.jsx`
- `src/admin/pages/authen/loginPage.jsx`

Mở Console (F12) và xem các log khi đăng nhập để biết:
- Request có được gửi không
- Response từ server là gì
- Token có được lưu không

---

### 10. Kiểm tra tài khoản test

Đảm bảo bạn có tài khoản hợp lệ trong database:
- Email: phải đúng format
- Password: phải khớp với database (đã được hash)
- Tài khoản: phải active/không bị khóa

---

## Liên hệ hỗ trợ

Nếu vẫn không giải quyết được, cung cấp thông tin sau:
1. Screenshot Console (F12)
2. Screenshot Network Tab (request/response)
3. Log từ backend (nếu có)
4. Mô tả chi tiết lỗi và các bước đã thử

