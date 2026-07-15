# Sunnie Note

Ứng dụng hỗ trợ hiệu suất cá nhân và chăm sóc sức khỏe tinh thần (wellness) hoạt động hoàn toàn ở phía client (Local-First), bảo vệ quyền riêng tư tuyệt đối cho dữ liệu cá nhân của người dùng.

## 🚀 Tính năng nổi bật
* **Trang tổng quan (Dashboard/Home):** Widget Bento, theo dõi lượng nước uống, ghi chép tâm trạng nhanh (Mood Tracker).
* **Quản lý công việc (Daily Joy):** Phân loại công việc chi tiết kèm hiệu ứng cổ vũ tinh thần.
* **Lịch biểu & Kế hoạch:** Lịch tuần thu nhỏ có thể vuốt ngang và lưới bento sự kiện.
* **Hệ thống Ghi chú (Notes System):** Trình chỉnh sửa văn bản đa định dạng (Rich Text), lọc nhanh theo nhãn dán.
* **Kiến trúc Local-First:** Toàn bộ dữ liệu được lưu trữ trên thiết bị thông qua IndexedDB (Dexie.js) và LocalStorage, tự động dọn dẹp dữ liệu cũ quá 30 ngày và hỗ trợ xuất/nhập tệp JSON sao lưu cục bộ.

---

## 🛠️ Chạy ứng dụng dưới local

### 1. Cài đặt các gói phụ thuộc
Di chuyển vào thư mục dự án và chạy:
```bash
npm install
```

### 2. Khởi động Metro Bundler
```bash
npm start
# Hoặc
npx expo start
```

Sau khi khởi chạy Metro Bundler, bạn có thể:
* Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại (iOS/Android) để chạy thử.
* Nhấn `a` để chạy trên máy ảo Android.
* Nhấn `i` để chạy trên máy ảo iOS (yêu cầu hệ điều hành macOS và Xcode).
* Nhấn `w` để chạy phiên bản Web.

---

## 📦 Hướng dẫn Build App (iOS & Android)

Để build ứng dụng thành file cài đặt độc lập (`.apk`, `.aab` cho Android hoặc `.ipa` cho iOS), chúng tôi khuyên dùng **EAS Build** (build trên cloud của Expo) vì bạn không cần máy Mac để build iOS hay cài đặt Android SDK/Xcode cục bộ phức tạp.

Chi tiết xem tại tài liệu hướng dẫn:
👉 **[Hướng dẫn Build iOS và Android chi tiết](file:///c:/Users/hung/Documents/GitHub/sunnienote/docs/deployment-guide.md)**

---

## 📂 Cấu trúc thư mục tài liệu
* **Mô tả dự án:** [mota.md](file:///c:/Users/hung/Documents/GitHub/sunnienote/mota.md)
* **Tính năng:** [tinh_nang.md](file:///c:/Users/hung/Documents/GitHub/sunnienote/tinh_nang.md)
* **Hướng dẫn build & deployment:** [deployment-guide.md](file:///c:/Users/hung/Documents/GitHub/sunnienote/docs/deployment-guide.md)