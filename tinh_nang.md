# Hướng dẫn & Đặc tả Tính năng ứng dụng Sunnie (Local-First React Native)

Sunnie là một ứng dụng di động hỗ trợ hiệu suất cá nhân và chăm sóc sức khỏe tinh thần (wellness) hoạt động hoàn toàn ở phía client (Local-First). Dưới đây là mô tả chi tiết về các phân hệ và tính năng hiện có trong ứng dụng đã xây dựng:

---

## 1. Kiến trúc Local-First & Bảo mật Ngoại tuyến
* **Bộ nhớ cục bộ**: Mọi dữ liệu (ghi chú, công việc, lịch họp, lượng nước uống, lịch sử tâm trạng) được lưu trữ hoàn toàn trên thiết bị của người dùng thông qua `@react-native-async-storage/async-storage`. Không yêu cầu internet hay máy chủ backend, bảo đảm quyền riêng tư tuyệt đối.
* **Tự động dọn dẹp (Automated Pruning)**: Mỗi lần khởi chạy, ứng dụng sẽ chạy ngầm để phát hiện và xóa dữ liệu hoàn thành (công việc, lịch sử uống nước, nhật ký tâm trạng) cũ hơn 30 ngày để tối ưu bộ nhớ thiết bị.
* **Xuất dữ liệu (Export)**: Người dùng có thể xuất toàn bộ dữ liệu thành một tệp sao lưu JSON đồng nhất thông qua menu cài đặt. Ứng dụng tích hợp với hộp chia sẻ hệ thống (`expo-sharing`) giúp dễ dàng gửi qua AirDrop, lưu trữ vào Files, hoặc gửi qua email.
* **Khôi phục dữ liệu (Import)**: Người dùng chọn tệp JSON sao lưu thông qua trình chọn tài liệu hệ thống (`expo-document-picker`) để ghi đè và tái thiết lập cơ sở dữ liệu cục bộ một cách liền mạch.
* **Khôi phục cài đặt gốc**: Xóa sạch toàn bộ AsyncStorage và đưa ứng dụng về trạng thái ban đầu với các dữ liệu mẫu trực quan.

---

## 2. Hệ thống Thiết kế UI/UX & Tương tác Nhỏ
* **Bảng màu ấm áp**: Sử dụng màu hồng/nâu chủ đạo (`#78555e`), sắc xanh lá tích cực (`#2f6a3f` & `#b2f2bb`), tím oải hương dịu (`#605a7c`) trên nền xám sáng sạch sẽ (`#f8f9fa`).
* **Phông chữ (Typography)**: Tải và hiển thị phông chữ `Quicksand` (cho tiêu đề thân thiện, bo góc nhẹ) và `Nunito Sans` (cho nội dung văn bản hiển thị rõ ràng, dễ đọc).
* **Hiệu ứng chạm đàn hồi (Bouncy-tap)**: Sử dụng Custom Component `<BouncyPressable>` giúp các nút bấm co giãn nhẹ nhàng khi chạm vào, tạo cảm giác xúc giác cao cấp.
* **Hiệu ứng hạt (Confetti/ConfettiView)**: Khi đánh dấu hoàn thành một nhiệm vụ, các bông tuyết/ngôi sao lấp lánh (`✨`, `🌟`, `🎉`) sẽ bắn ra từ điểm chạm của người dùng.
* **Lời chúc toast (CheerToast)**: Một thanh toast màu xanh mềm mại trượt lên từ phía dưới khi hoàn thành công việc kèm theo các câu cổ vũ ngẫu nhiên như *"Bạn thật tuyệt vời!"* hay *"Làm tốt lắm!"*.

---

## 3. Các Phân hệ & Màn hình Chức năng

### Khởi động trực tiếp (Bỏ qua Đăng nhập)
* **Truy cập tức thì**: Luồng giới thiệu (Onboarding) và Đăng nhập (Login) đã được gỡ bỏ hoàn toàn theo yêu cầu. Ứng dụng sẽ tự động mở trực tiếp Trang tổng quan (Dashboard) khi khởi chạy, mang lại trải nghiệm nhanh chóng mà không cần bất kỳ bước thiết lập hay tài khoản nào.

### Trang tổng quan (Dashboard/Home)
* **Chào hỏi cá nhân hóa**: Tự động hiển thị lời chào phù hợp theo thời gian thực (Chào buổi sáng ☀️ / chiều 🌤️ / tối 🌙) kèm theo tên người dùng.
* **Bộ theo dõi nước (Water Tracker)**: Bento card hiển thị lượng nước đã uống (ví dụ: `1.2L / 2L`), phần trăm tiến trình và thanh cuộn sóng nước chuyển động liên tục (`WaveProgress` sử dụng SVG). Nút `+ Thêm 250ml` cập nhật tiến trình ngay lập tức.
* **Xem lịch hẹn nhanh (Lịch hẹn sắp tới)**: Chỉ hiển thị các cuộc họp hoặc sự kiện chưa diễn ra (trong tương lai hoặc thời gian muộn hơn trong ngày hiện tại) và sắp xếp theo thứ tự thời gian gần nhất. Các lịch trình đã diễn ra sẽ chỉ hiển thị khi xem toàn bộ lịch trình ở tab Lịch biểu.
* **Ghi chép tâm trạng (Mood Tracker)**: Chọn nhanh trạng thái cảm xúc hôm nay (😊 Vui vẻ, ✨ Tích cực, 🌸 Bình yên...) và lưu trữ vào lịch sử.

### Quản lý công việc (Daily Joy Tasks)
* **Thống kê tiến độ**: Hiển thị thẻ cổ vũ tiến trình kèm số lượng công việc còn lại trong ngày.
* **Danh sách Bento**: Công việc được phân loại rõ ràng (Self Care - Chăm sóc bản thân, Projects - Dự án, Home - Việc nhà).
* **Checkbox tròn chuyển động**: Ô tích tròn tùy biến khi bấm sẽ kích hoạt hiệu ứng gạch ngang (`strikethrough`), giảm độ mờ (`opacity`), đồng thời tạo pháo hoa và toast động viên.
* **Thêm công việc mới**: Hỗ trợ modal trượt từ dưới lên nhập tên công việc và chọn nhanh danh mục thông qua các chip tròn.

### Lịch biểu & Nhắc nhở (Calendar & Scheduler)
* **Lịch tuần mini**: Thanh cuộn ngang hiển thị các ngày trong tuần. Nhấp vào một ngày sẽ tự động lọc danh sách cuộc họp của ngày đó.
* **Bộ chọn giờ trực quan**: Bộ tăng/giảm giờ và phút dạng dọc kèm nút chuyển đổi AM/PM.
* **Bento Grid sự kiện**: Hiển thị chi tiết sự kiện kèm theo ảnh địa điểm (Ví dụ: Blue Bottle Cafe), giờ họp cụ thể, thẻ gắn mức độ khẩn cấp (Urgent), và công tắc (Switch) tắt/bật báo thức nhắc nhở.

### Hệ thống Ghi chú (Notes & Detail Editor)
* **Tìm kiếm & Phân loại**: Bộ lọc nhanh theo thẻ (All, Important, Personal, Social) kết hợp tìm kiếm văn bản thời gian thực trong tiêu đề và nội dung ghi chú.
* **Bento Notes Grid**: Ghi chú quan trọng (Important) tự động được phóng to thành thẻ nổi bật chứa icon trang trí ẩn sau nền. Các ghi chú khác hiển thị dưới dạng lưới 2 cột nhỏ gọn hoặc danh sách chi tiết.
* **Trình soạn thảo chi tiết (Editor)**:
  - Cho phép tùy chỉnh tag phân loại ghi chú.
  - Hộp nhập văn bản đa dòng phong cách Glassmorphism.
  - Tích hợp checklist phụ bên trong ghi chú, cho phép thêm mới/tích chọn/xóa các mục đồ cần chuẩn bị.
  - Đính kèm ảnh bìa tràn viền (full-bleed).
  - Chọn thời gian dự kiến diễn ra.

### Cài đặt ứng dụng (Settings & Profile)
* Cho phép người dùng trực tiếp thay đổi và lưu tên của mình (Tên người dùng) thông qua ô nhập văn bản tích hợp.
* Không hiển thị ảnh đại diện và thẻ danh hiệu "Thành viên thân thiết" theo mong muốn tối giản hóa thông tin.
* Công tắc tắt/bật thông báo nhắc uống nước và nhắc lịch hẹn sự kiện.
* Xem thông tin chi tiết về dung lượng bộ nhớ dữ liệu đã tiêu thụ trên thiết bị.
* Nút trigger dọn dẹp bộ nhớ thủ công, xuất tệp sao lưu JSON, nhập tệp phục hồi JSON, và khôi phục cài đặt gốc. (Nút Đăng xuất đã được gỡ bỏ để tối ưu hóa trải nghiệm không tài khoản).

---

## 4. Liên kết Thông báo Thiết bị
* **Nhắc nhở thời gian thực**: Các chức năng thiết lập thời gian cho sự kiện được liên kết trực tiếp với dịch vụ thông báo của hệ điều hành điện thoại (`expo-notifications`). Khi bạn tạo lịch hẹn hoặc sự kiện vào thời gian trong tương lai, điện thoại sẽ tự động hiển thị thông báo đẩy đúng giờ chỉ định, ngay cả khi ứng dụng đã tắt.
