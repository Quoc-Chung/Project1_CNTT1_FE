import React from "react";
import Breadcrumb from "../Common/Breadcrumb";

const TermsOfService = () => {
  return (
    <>
      <Breadcrumb title="Điều khoản sử dụng" pages={["điều khoản sử dụng"]} />

      <section className="overflow-hidden py-12 lg:py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 lg:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Điều Khoản Sử Dụng
            </h1>
            <p className="text-sm text-gray-600 mb-8">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
            </p>

            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Chấp nhận điều khoản
                </h2>
                <p className="mb-4 leading-relaxed">
                  Bằng việc truy cập và sử dụng trang web Proshop, bạn đồng ý tuân thủ và bị ràng buộc
                  bởi các điều khoản và điều kiện sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của
                  các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Đăng ký tài khoản
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Để sử dụng một số tính năng của trang web, bạn cần đăng ký tài khoản. Khi đăng ký, bạn cam kết:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                    <li>Bảo mật mật khẩu và tài khoản của bạn</li>
                    <li>Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn</li>
                    <li>Thông báo ngay lập tức nếu phát hiện vi phạm bảo mật</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Đặt hàng và thanh toán
                </h2>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.1. Quy trình đặt hàng
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Bạn có thể đặt hàng thông qua trang web hoặc ứng dụng</li>
                    <li>Đơn hàng chỉ được xác nhận sau khi chúng tôi nhận được thanh toán</li>
                    <li>Chúng tôi có quyền từ chối hoặc hủy đơn hàng bất cứ lúc nào</li>
                    <li>Giá sản phẩm có thể thay đổi mà không cần thông báo trước</li>
                  </ul>

                  <h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">
                    3.2. Thanh toán
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Chúng tôi chấp nhận các phương thức thanh toán: thẻ tín dụng, chuyển khoản, COD</li>
                    <li>Thanh toán phải được thực hiện trong thời hạn quy định</li>
                    <li>Mọi giao dịch đều được mã hóa và bảo mật</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Giao hàng
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Thời gian giao hàng phụ thuộc vào địa điểm và phương thức vận chuyển</li>
                  <li>Phí vận chuyển sẽ được tính dựa trên trọng lượng và khoảng cách</li>
                  <li>Bạn chịu trách nhiệm cung cấp địa chỉ giao hàng chính xác</li>
                  <li>Rủi ro về hàng hóa chuyển sang bạn khi hàng được giao thành công</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Đổi trả và hoàn tiền
                </h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Chúng tôi chấp nhận đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với các điều kiện:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Sản phẩm còn nguyên vẹn, chưa sử dụng, còn tem mác</li>
                    <li>Có hóa đơn mua hàng</li>
                    <li>Sản phẩm không nằm trong danh mục không được đổi trả</li>
                    <li>Phí vận chuyển đổi trả do khách hàng chịu (trừ trường hợp lỗi từ phía chúng tôi)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Quyền sở hữu trí tuệ
                </h2>
                <p className="mb-4 leading-relaxed">
                  Tất cả nội dung trên trang web, bao gồm nhưng không giới hạn: văn bản, hình ảnh, logo,
                  thiết kế, phần mềm, đều thuộc quyền sở hữu của Proshop hoặc được cấp phép sử dụng.
                  Bạn không được phép sao chép, sử dụng hoặc phân phối bất kỳ nội dung nào mà không có
                  sự cho phép bằng văn bản của chúng tôi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Hành vi bị cấm
                </h2>
                <p className="mb-4 leading-relaxed">
                  Bạn không được phép:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Sử dụng trang web cho mục đích bất hợp pháp</li>
                  <li>Xâm nhập hoặc cố gắng xâm nhập hệ thống của chúng tôi</li>
                  <li>Phát tán virus, malware hoặc mã độc</li>
                  <li>Giả mạo danh tính hoặc thông tin</li>
                  <li>Quấy rối, đe dọa hoặc làm tổn hại đến người khác</li>
                  <li>Vi phạm quyền sở hữu trí tuệ</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Giới hạn trách nhiệm
                </h2>
                <p className="mb-4 leading-relaxed">
                  Proshop không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên
                  hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi,
                  bao gồm nhưng không giới hạn: mất dữ liệu, lợi nhuận, hoặc cơ hội kinh doanh.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Thay đổi dịch vụ
                </h2>
                <p className="mb-4 leading-relaxed">
                  Chúng tôi có quyền thay đổi, tạm ngừng hoặc chấm dứt bất kỳ phần nào của dịch vụ mà không
                  cần thông báo trước. Chúng tôi không chịu trách nhiệm nếu dịch vụ không khả dụng do
                  bảo trì, cập nhật hoặc các lý do khác.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Luật áp dụng
                </h2>
                <p className="mb-4 leading-relaxed">
                  Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ
                  được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  11. Thay đổi điều khoản
                </h2>
                <p className="mb-4 leading-relaxed">
                  Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực
                  ngay sau khi được đăng tải trên trang web. Việc bạn tiếp tục sử dụng dịch vụ sau khi có
                  thay đổi được coi là bạn đã chấp nhận các điều khoản mới.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  12. Liên hệ
                </h2>
                <p className="mb-4 leading-relaxed">
                  Nếu bạn có câu hỏi về các điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
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

export default TermsOfService;

