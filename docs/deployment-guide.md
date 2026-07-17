# Hướng Dẫn Build App iOS và Android - Sunnie

Tài liệu này hướng dẫn cách build ứng dụng Sunnie (React Native / Expo v54+) cho hai nền tảng **iOS** và **Android** theo hai phương thức: **Build trên Cloud (EAS Build - Khuyên dùng)** và **Build cục bộ (Local Build)**.

---

## 1. Điều kiện tiên quyết (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau:
* **Node.js** (Phiên bản LTS khuyên dùng, tương thích với Expo SDK 54).
* **Git** để quản lý mã nguồn.
* **Tài khoản Expo**: Đăng ký miễn phí tại [expo.dev](https://expo.dev).
* **EAS CLI**: Cài đặt công cụ dòng lệnh của Expo để build cloud:
  ```bash
  npm install -g eas-cli
  ```
  Sau khi cài đặt, đăng nhập vào tài khoản Expo của bạn:
  ```bash
  eas login
  ```

---

## 2. Cách 1: Build trên Cloud bằng EAS Build (Khuyên dùng)

**EAS Build (Expo Application Services)** là cách đơn giản nhất vì bạn không cần máy Mac để build iOS, cũng không cần cài đặt Android SDK/Xcode nặng nề trên máy tính cá nhân. Việc build được thực hiện hoàn toàn trên máy chủ của Expo.

### Bước 2.1: Khởi tạo dự án trên EAS (Nếu chưa thực hiện)
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
eas project:init
```

### Bước 2.2: Cấu hình build (`eas.json`)
Dự án đã có sẵn file [eas.json](file:///c:/Users/hung/Documents/GitHub/sunnienote/eas.json). Nếu bạn muốn build file APK cài đặt trực tiếp cho Android để kiểm thử thay vì file AAB (dùng để upload lên Google Play), hãy cập nhật cấu hình profile `preview` trong `eas.json` như sau:
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

### Bước 2.3: Thực hiện Build

#### A. Build cho Android
* **Bản thử nghiệm (APK cài trực tiếp):**
  ```bash
  eas build --platform android --profile preview
  ```
  *Sau khi build xong, EAS sẽ cung cấp một đường link/mã QR để tải file `.apk` về điện thoại Android.*

* **Bản Production (AAB để phát hành lên Google Play):**
  ```bash
  eas build --platform android --profile production
  ```

#### B. Build cho iOS
*(Lưu ý: Build iOS trên EAS yêu cầu tài khoản Apple Developer để tạo chứng chỉ ký số, trừ khi bạn build bản Simulator).*
* **Bản Simulator (Chạy trên máy ảo iOS của Mac):**
  ```bash
  eas build --platform ios --profile development --simulator
  ```
* **Bản thử nghiệm Ad-Hoc (Cài trên các thiết bị đăng ký trước):**
  ```bash
  eas build --platform ios --profile preview
  ```
* **Bản Production (Phát hành lên App Store):**
  ```bash
  eas build --platform ios --profile production
  ```

---

## 3. Cách 2: Build cục bộ (Local Build)

Cách này phù hợp khi bạn muốn chạy thử ứng dụng trực tiếp trên máy ảo hoặc thiết bị thật cắm vào máy tính trong quá trình phát triển (Development).

### Bước 3.1: Tạo thư mục mã nguồn Native (Prebuild)
Expo sử dụng cơ chế tạo mã nguồn iOS/Android tự động từ cấu hình `app.json`. Chạy lệnh sau để sinh ra thư mục `/ios` và `/android` (đã được bỏ qua trong `.gitignore`):
```bash
npx expo prebuild
```

### Bước 3.2: Chạy và build cục bộ

#### A. Cho Android
* **Yêu cầu:** Máy tính đã cài đặt **Android Studio**, **Android SDK**, cấu hình biến môi trường `ANDROID_HOME`, và đã chạy máy ảo (Emulator) hoặc cắm thiết bị Android thật đã bật "USB Debugging".
* **Lệnh chạy:**
  ```bash
  npx expo run:android
  ```

#### B. Cho iOS
* **Yêu cầu:** Bạn **bắt buộc** phải sử dụng máy Mac cài đặt **Xcode**, **CocoaPods** và máy ảo iOS Simulator hoặc thiết bị thật iOS.
* **Lệnh chạy:**
  ```bash
  npx expo run:ios
  ```

---

## 4. Các lệnh phát triển thường dùng (Development Command)

* **Khởi động Metro Bundler:**
  ```bash
  npm start
  # Hoặc
  npx expo start
  ```
* **Phát triển trực tiếp qua ứng dụng Expo Go (Dành cho bản không có thư viện native tùy biến):**
  * Tải app **Expo Go** trên App Store hoặc Google Play.
  * Quét mã QR hiển thị từ lệnh Metro Bundler để mở app.

---

## 5. Hướng dẫn Deploy lên Vercel (Web)

Chúng tôi đã cấu hình sẵn file [vercel.json](file:///c:/Users/hung/Documents/GitHub/sunnienote/vercel.json) và script `build` trong [package.json](file:///c:/Users/hung/Documents/GitHub/sunnienote/package.json). Bạn có thể deploy ứng dụng lên Vercel theo hai phương thức sau:

### Cách 1: Deploy tự động qua GitHub (Khuyên dùng)
1. Đẩy mã nguồn dự án lên một kho lưu trữ **GitHub** (hoặc GitLab/Bitbucket).
2. Truy cập vào trang quản lý [Vercel Dashboard](https://vercel.com/dashboard).
3. Nhấp vào **Add New** -> **Project**, sau đó chọn kho lưu trữ chứa dự án của bạn.
4. Tại phần cấu hình, Vercel sẽ tự nhận diện dựa trên cấu hình [vercel.json](file:///c:/Users/hung/Documents/GitHub/sunnienote/vercel.json):
   * **Framework Preset**: Chọn `Other`.
   * **Build Command**: `npm run build` (hoặc `npx expo export --platform web`).
   * **Output Directory**: `dist`.
5. Nhấp vào **Deploy**. Vercel sẽ tự động build và cung cấp domain chạy thử sau vài phút. Kể từ lúc này, mỗi khi bạn đẩy mã nguồn mới lên nhánh chính (main/master), Vercel sẽ tự động build lại.

### Cách 2: Deploy thủ công bằng Vercel CLI
Nếu bạn muốn deploy trực tiếp từ máy tính cục bộ của mình:
1. Cài đặt **Vercel CLI** toàn cục nếu chưa có:
   ```bash
   npm i -g vercel
   ```
2. Đăng nhập vào tài khoản Vercel:
   ```bash
   vercel login
   ```
3. Chạy lệnh sau tại thư mục gốc của dự án để tạo bản Preview:
   ```bash
   vercel
   ```
   *(Nhập các thiết lập mặc định khi CLI yêu cầu)*.
4. Chạy lệnh sau để deploy lên môi trường Production:
   ```bash
   vercel --prod
   ```
