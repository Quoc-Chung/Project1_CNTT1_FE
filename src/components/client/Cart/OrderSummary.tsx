
import React from "react";
import { useAppSelector } from "../../../redux/store";
import { useRouter } from "next/navigation";
import { CartOrderResponse } from "../../../types/Client/CartOrder/cartorder";

interface OrderSummaryProps {
  selectedItems?: CartOrderResponse[];
}

const OrderSummary = ({ selectedItems }: OrderSummaryProps) => {
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.cart);
  const token = useAppSelector((state) => state.auth.token);
  
  // Sử dụng selectedItems nếu có, nếu không thì dùng tất cả cartItems
  const itemsToCalculate = selectedItems && selectedItems.length > 0 ? selectedItems : cartItems;
  
  // Tính tổng tiền chỉ cho các sản phẩm được chọn
  const totalPrice = itemsToCalculate.reduce((total, item) => {
    return total + (item.productPrice * item.quantity);
  }, 0);

  // Handle checkout click
  const handleCheckout = () => {
    console.log("Checkout clicked", { 
      selectedItemsLength: itemsToCalculate.length, 
      hasToken: !!token 
    });
    
    if (itemsToCalculate.length === 0) {
      console.log("No items selected, cannot checkout");
      return;
    }
    
    if (!token) {
      console.log("No token, redirecting to signin");
      router.push("/signin");
      return;
    }
    
    // Lưu selectedItems vào sessionStorage để checkout page có thể sử dụng
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedCartItems', JSON.stringify(itemsToCalculate));
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
          {itemsToCalculate.map((item, key) => (
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
          
          {itemsToCalculate.length === 0 && (
            <div className="py-5 text-center text-gray-500">
              <p>Vui lòng chọn ít nhất một sản phẩm để đặt hàng</p>
            </div>
          )}

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
            disabled={itemsToCalculate.length === 0}
            className="w-full flex justify-center font-medium text-white bg-blue py-1.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
          >
            Đặt hàng ({itemsToCalculate.length} sản phẩm)
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
