# Frontend - Hệ thống quản lý quán bia hơi

## 1. Yêu cầu môi trường
- Node.js 20+
- npm 10+

## 2. Cài đặt
```bash
npm install
```

## 3. Chạy local
```bash
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`.

## 4. Build production
```bash
npm run build
npm run preview
```

## 5. Tài khoản demo
- Quản lý: `manager / manager123`
- Kế toán: `accountant / accountant123`
- Nhân viên: `staff / staff123`
- Khách hàng: `customer / customer123`

## 6. Cấu trúc thư mục (feature-based)
```text
src/
  app/
    layout/
    providers/
    router.tsx
  components/
    ui/
  features/
    auth/
      components/
      data/
      hooks/
      pages/
      services/
      store/
    reservations/
      components/
      data/
      pages/
      store/
      types.ts
    common/pages/
  styles/
  types/
```

## 7. Ghi chú
- Dự án frontend-only, dùng mock data.
- Auth mock không token, lưu session bằng `localStorage`.
- UC1 có đầy đủ flow: tìm bàn, giữ bàn 5 phút, nhập liên hệ, đặt cọc mô phỏng, đặt món trước, hủy bàn và tự động quá hạn 30 phút chưa check-in.
