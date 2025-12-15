import React from "react";
import Breadcrumb from "../Common/Breadcrumb";

const PrivacyPolicy = () => {
  return (
    <>
      <Breadcrumb title="Chính sách bảo mật" pages={["chính sách bảo mật"]} />

      <section className="overflow-hidden py-12 lg:py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 lg:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Chính Sách Bảo Mật
            </h1>
            <p className="text-sm text-gray-600 mb-8">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>

            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Giới thiệu
                </h2>
                <p className="mb-4 leading-relaxed">
                  Proshop cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng.
                  Chính sách bảo mật này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ
                  thông tin của bạn khi sử dụng dịch vụ của chúng tôi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Thông tin chúng tôi thu thập
                </h2>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.1. Thông tin cá nhân
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Họ và tên</li>
                    <li>Địa chỉ email</li>
                    <li>Số điện thoại</li>
                    <li>Địa chỉ giao hàng</li>
                    <li>Thông tin thanh toán (được mã hóa và bảo mật)</li>
                  </ul>

                  <h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">
                    2.2. Thông tin tự động
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Địa chỉ IP</li>
                    <li>Loại trình duyệt và thiết bị</li>
                    <li>Thông tin về cách bạn sử dụng trang web</li>
                    <li>Cookies và công nghệ theo dõi tương tự</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Cách chúng tôi sử dụng thông tin
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Xử lý và hoàn thành đơn hàng của bạn</li>
                  <li>Giao tiếp với bạn về đơn hàng, sản phẩm và dịch vụ</li>
                  <li>Cải thiện trải nghiệm người dùng trên trang web</li>
                  <li>Gửi thông tin khuyến mãi và cập nhật (nếu bạn đồng ý)</li>
                  <li>Phòng chống gian lận và bảo vệ an ninh</li>
                  <li>Tuân thủ các yêu cầu pháp lý</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Bảo mật thông tin
                </h2>
                <p className="mb-4 leading-relaxed">
                  Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mã hóa SSL/TLS cho tất cả các giao dịch</li>
                  <li>Lưu trữ an toàn trên máy chủ được bảo vệ</li>
                  <li>Giới hạn quyền truy cập thông tin chỉ cho nhân viên cần thiết</li>
                  <li>Thường xuyên cập nhật và kiểm tra hệ thống bảo mật</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Chia sẻ thông tin
                </h2>
                <p className="mb-4 leading-relaxed">
                  Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba,
                  ngoại trừ các trường hợp sau:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nhà cung cấp dịch vụ hỗ trợ hoạt động của chúng tôi (vận chuyển, thanh toán)</li>
                  <li>Khi được yêu cầu bởi pháp luật hoặc cơ quan có thẩm quyền</li>
                  <li>Để bảo vệ quyền và tài sản của chúng tôi</li>
                  <li>Với sự đồng ý của bạn</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Cookies
                </h2>
                <p className="mb-4 leading-relaxed">
                  Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn trên trang web.
                  Bạn có thể điều chỉnh cài đặt cookies trong trình duyệt của mình, nhưng điều này
                  có thể ảnh hưởng đến một số chức năng của trang web.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Quyền của bạn
                </h2>
                <p className="mb-4 leading-relaxed">
                  Bạn có quyền:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Truy cập và xem thông tin cá nhân của bạn</li>
                  <li>Yêu cầu chỉnh sửa hoặc xóa thông tin</li>
                  <li>Từ chối nhận email marketing</li>
                  <li>Rút lại sự đồng ý bất cứ lúc nào</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Thay đổi chính sách
                </h2>
                <p className="mb-4 leading-relaxed">
                  Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian.
                  Mọi thay đổi sẽ được thông báo trên trang web này với ngày cập nhật mới nhất.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Liên hệ
                </h2>
                <p className="mb-4 leading-relaxed">
                  Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li>Email: support@Proshop.com</li>
                  <li>Điện thoại: (+84) 0365419076</li>
                  <li>Địa chỉ: Trường Đại Học Giao Thông Vận Tải</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;

