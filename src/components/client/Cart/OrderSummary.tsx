
import React from "react";
import { useAppSelector } from "../../../redux/store";
import { useRouter } from "next/navigation";

const OrderSummary = () => {
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.cart);
  const token = useAppSelector((state) => state.auth.token);
  
  // Tính tổng tiền
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.productPrice * item.quantity);
  }, 0);

  // Handle checkout click
  const handleCheckout = () => {
    console.log("Checkout clicked", { cartItemsLength: cartItems.length, hasToken: !!token });
    
    if (cartItems.length === 0) {
      console.log("Cart is empty, cannot checkout");
      return;
    }
    
    if (!token) {
      console.log("No token, redirecting to signin");
      router.push("/signin");
      return;
    }
    
    console.log("Navigating to checkout page");
    router.push("/checkout");
  };

  return (
    <div className="lg:max-w-[455px] w-full">
      {/* <!-- order list box --> */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartItems.map((item, key) => (
            <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
              <div>
                <p className="text-dark">{item.productName}</p>
              </div>
              <div>
                <p className="text-dark text-right">
                  {(item.productPrice * item.quantity).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          ))}

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Tổng cộng</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                {totalPrice.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full flex justify-center font-medium text-white bg-blue py-1.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
          >
            Đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
