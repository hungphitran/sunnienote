Tài liệu Đặc tả Dự án: Sunnie (Kiến trúc Local-First)
Sunnie là một ứng dụng hỗ trợ hiệu suất cá nhân và chăm sóc sức khỏe tinh thần (wellness) hoạt động hoàn toàn ở phía client (trình duyệt/thiết bị người dùng). Ứng dụng giúp người dùng quản lý công việc hàng ngày, ghi chú, lịch họp và thói quen trong một không gian ấm áp, đầy khích lệ mà không cần phụ thuộc vào máy chủ bên ngoài, đảm bảo quyền riêng tư tuyệt đối cho dữ liệu cá nhân.

1. Hệ thống Thiết kế UI/UX (UI/UX Design System)
   Giao diện ứng dụng được tùy biến dựa trên cảm hứng từ ngôn ngữ Material Design 3 (M3), tập trung vào sự mềm mại, nhẹ nhàng và tích cực.

Bảng màu (Color Palette):

Màu chủ đạo (Primary - Hồng ấm/Nâu đất - #78555e): Dùng cho các hành động chính, nút hành động nổi (FAB - Floating Action Button) và các văn bản cần nhấn mạnh.

Màu phụ (Secondary - Xanh lá mềm mại - #2f6a3f & #b2f2bb): Dùng cho các hành động tích cực, trạng thái hoàn thành công việc và theo dõi sức khỏe.

Màu bổ trợ (Tertiary - Tím oải hương dịu - #605a7c & #e1d8ff): Dùng cho các điểm nhấn và phân loại danh mục phụ.

Màu nền (Backgrounds - #f8f9fa): Bề mặt giao diện sạch sẽ, sử dụng các lớp màu sắc chuyển tông nhẹ nhàng (tonal variations) kết hợp với đổ bóng môi trường (ambient shadows) mềm mại.

Phông chữ (Typography): Sử dụng phông Quicksand cho các tiêu đề thân thiện và Nunito Sans để hiển thị nội dung văn bản rõ ràng, dễ đọc.

Tương tác nhỏ (Micro-interactions): Hiệu ứng co giãn đàn hồi khi chạm (bouncy-tap), bong bóng nền chuyển động trôi nổi và hiệu ứng tung bông tuyết/pháo hoa (particle/confetti) khi hoàn thành công việc.

2. Các Phân hệ Cốt lõi (Core Application Modules)
   Trang tổng quan (Dashboard/Home): Hiển thị lời chào cá nhân hóa, bộ theo dõi lượng nước uống (Water Tracker) với thanh tiến trình dạng sóng nước chuyển động, một widget dạng bento hiển thị các cuộc họp sắp tới (Upcoming Meetings) và bộ ghi chép tâm trạng nhanh (Mood Tracker).

Quản lý công việc (Task Management - "Daily Joy"): Danh sách công việc được phân loại rõ ràng (Chăm sóc bản thân, Dự án, Việc nhà) với các ô chọn (checkbox) hình tròn tùy biến. Công việc khi hoàn thành sẽ có hiệu ứng gạch ngang, giảm độ mờ (opacity) và kích hoạt một thông báo nhỏ (toast) cổ vũ tinh thần.

Lịch biểu & Kế hoạch (Calendar & Scheduler): Tích hợp một lịch tuần thu nhỏ có thể vuốt ngang (horizontal swipeable mini-calendar), bộ chọn thời gian dạng dọc trực quan và lưới bento chi tiết cho sự kiện kèm hình ảnh địa điểm và thẻ gắn mức độ khẩn cấp.

Hệ thống Ghi chú (Notes System): Trình chỉnh sửa văn bản đa định dạng (Rich Text) đi kèm danh sách việc cần làm (checklist) tùy biến và khả năng đính kèm hình ảnh tràn viền (full-bleed). Ghi chú có thể lọc nhanh theo thẻ (Quan trọng, Cá nhân, Xã hội).

3. Kiến trúc Kỹ thuật Ưu tiên Ngoại tuyến (Local-First Architecture)
   Mọi dữ liệu được lưu trữ trực tiếp trên thiết bị của người dùng, loại bỏ hoàn toàn hạ tầng backend và sự phụ thuộc vào kết nối mạng.

IndexedDB qua Dexie.js: Đóng vai trò là cơ sở dữ liệu chính. Thư viện này quản lý lượng lớn dữ liệu bất đồng bộ có cấu trúc, cực kỳ phù hợp cho các phân hệ Ghi chú, Công việc và Sự kiện lịch. Dexie.js giúp đơn giản hóa việc truy vấn, đánh chỉ mục (index) và quản lý phiên bản cơ sở dữ liệu (schema versioning).

LocalStorage: Chỉ được sử dụng để lưu trữ các dữ liệu dạng chuỗi (string) dung lượng nhẹ, ví dụ như tùy chọn giao diện (sáng/tối), cấu hình bố cục ứng dụng và thông tin định danh hồ sơ cơ bản.

4. Quản lý & Vòng đời Dữ liệu (Data Management & Lifecycle)
   Để tránh tình trạng đầy bộ nhớ thiết bị và duy trì hiệu năng mượt mà, ứng dụng áp dụng các cơ chế dọn dẹp dữ liệu nghiêm ngặt.

Tự động dọn dẹp (Automated Pruning): Một công cụ chạy ngầm khi khởi chạy ứng dụng sẽ âm thầm xóa bỏ các thông tin đã lỗi thời (ví dụ: các công việc đã hoàn thành hoặc lịch sử tâm trạng cũ hơn 30 ngày).

Kiểm soát bộ nhớ thủ công (Manual Storage Controls): Một bảng điều khiển trong menu cài đặt cho phép người dùng xem dung lượng bộ nhớ đã tiêu thụ và chủ động xóa từng danh mục cụ thể, chẳng hạn như ảnh đính kèm trong bộ nhớ đệm (cache) hoặc các sự kiện lịch trong quá khứ.

Khôi phục cài đặt gốc (Factory Reset): Hành động xóa vĩnh viễn toàn bộ dữ liệu trong IndexedDB và LocalStorage, đưa ứng dụng trở về trạng thái ban đầu như mới cài đặt.

5. Sao lưu & Di chuyển Dữ liệu (Backup & Portability)
   Vì dữ liệu hoàn toàn độc lập và chỉ nằm trong trình duyệt hiện tại, hệ thống cung cấp tính năng xuất/nhập dữ liệu ngoại tuyến để người dùng dễ dàng di chuyển.

Xuất tệp tin cục bộ (Local File Export): Ứng dụng sẽ tuần tự hóa (serialize) toàn bộ các bảng dữ liệu từ IndexedDB thành một cấu trúc JSON đồng nhất và tải xuống thiết bị của người dùng dưới dạng một tệp sao lưu.

Khôi phục dữ liệu (Restore): Người dùng có thể tải lên tệp JSON đã xuất thông qua menu cài đặt. Hệ thống sẽ phân tích cú pháp tệp tin, xóa bỏ trạng thái dữ liệu hiện tại trên thiết bị và tái thiết lập cơ sở dữ liệu cục bộ một cách liền mạch.
