import { Dispatch } from "react";
import { CreateOrderRequest, OrderResponse } from "../../../types/Client/Order/order";
import {
  CREATE_ORDER,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  GET_ALL_ORDERS,
  GET_ALL_ORDERS_SUCCESS,
  GET_ALL_ORDERS_FAILURE,
  GET_ORDER_BY_ID,
  GET_ORDER_BY_ID_SUCCESS,
  GET_ORDER_BY_ID_FAILURE,
  RESET_ORDER_STATE,
} from "./ActionType";
import { BASE_API_CART_URL } from "../../../utils/configAPI";
import { ApiResponse } from "../../../types/Common/common";

// Tạo đơn hàng mới
export const createOrderAction = (
  request: CreateOrderRequest,
  token: string,
  onSuccess?: (res: ApiResponse<OrderResponse>) => void,
  onError?: (error: string) => void
) => async (dispatch: Dispatch<any>) => {
  dispatch({ type: CREATE_ORDER });

  // Validate token
  if (!token || token.trim() === "") {
    const errorMsg = "Token không hợp lệ. Vui lòng đăng nhập lại.";
    dispatch({ type: CREATE_ORDER_FAILURE, payload: errorMsg });
    onError?.(errorMsg);
    return;
  }

  try {
    // Ensure token is properly formatted (remove any extra spaces)
    const cleanToken = token.trim();
    
    const res = await fetch(`${BASE_API_CART_URL}/api/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanToken}`,
      },
      body: JSON.stringify(request),
    });

    // Kiểm tra status code trước khi parse JSON
    if (res.status === 403) {
      dispatch({ type: CREATE_ORDER_FAILURE, payload: "Token hết hạn" });
      onError?.("Token hết hạn");
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      dispatch({ type: CREATE_ORDER_FAILURE, payload: errorText || "Lỗi khi tạo đơn hàng" });
      onError?.(errorText || "Lỗi khi tạo đơn hàng");
      return;
    }

    const resData: ApiResponse<OrderResponse> = await res.json();

    if (resData.status.code === "200" || resData.status.code === "201") {
      dispatch({ type: CREATE_ORDER_SUCCESS, payload: resData.data });
      onSuccess?.(resData);
    } else {
      dispatch({ type: CREATE_ORDER_FAILURE, payload: resData.status.message });
      onError?.(resData.status.message);
    }
  } catch (error: any) {
    dispatch({ type: CREATE_ORDER_FAILURE, payload: error.message });
    onError?.(error.message);
  }
};

// Lấy tất cả đơn hàng của người dùng
export const getAllOrdersAction = (
  token: string,
  onSuccess?: (res: ApiResponse<OrderResponse[]>) => void,
  onError?: (error: string) => void
) => async (dispatch: Dispatch<any>) => {
  dispatch({ type: GET_ALL_ORDERS });

  try {
    const res = await fetch(`${BASE_API_CART_URL}/api/order/my-orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 403) {
      dispatch({ type: GET_ALL_ORDERS_FAILURE, payload: "Token hết hạn" });
      onError?.("Token hết hạn");
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      dispatch({ type: GET_ALL_ORDERS_FAILURE, payload: errorText || "Lỗi khi lấy danh sách đơn hàng" });
      onError?.(errorText || "Lỗi khi lấy danh sách đơn hàng");
      return;
    }

    const resData: ApiResponse<OrderResponse[]> = await res.json();

    if (resData.status.code === "200") {
      dispatch({ type: GET_ALL_ORDERS_SUCCESS, payload: resData.data });
      onSuccess?.(resData);
    } else {
      dispatch({ type: GET_ALL_ORDERS_FAILURE, payload: resData.status.message });
      onError?.(resData.status.message);
    }
  } catch (error: any) {
    dispatch({ type: GET_ALL_ORDERS_FAILURE, payload: error.message });
    onError?.(error.message);
  }
};

// Lấy đơn hàng theo ID
export const getOrderByIdAction = (
  orderId: string,
  token: string,
  onSuccess?: (res: ApiResponse<OrderResponse>) => void,
  onError?: (error: string) => void
) => async (dispatch: Dispatch<any>) => {
  dispatch({ type: GET_ORDER_BY_ID });

  try {
    const res = await fetch(`${BASE_API_CART_URL}/api/order/detail/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 403) {
      dispatch({ type: GET_ORDER_BY_ID_FAILURE, payload: "Token hết hạn" });
      onError?.("Token hết hạn");
      return;
    }

    if (res.status === 404) {
      dispatch({ type: GET_ORDER_BY_ID_FAILURE, payload: "Không tìm thấy đơn hàng" });
      onError?.("Không tìm thấy đơn hàng");
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      dispatch({ type: GET_ORDER_BY_ID_FAILURE, payload: errorText || "Lỗi khi lấy thông tin đơn hàng" });
      onError?.(errorText || "Lỗi khi lấy thông tin đơn hàng");
      return;
    }

    const resData: ApiResponse<OrderResponse> = await res.json();

    if (resData.status.code === "200") {
      dispatch({ type: GET_ORDER_BY_ID_SUCCESS, payload: resData.data });
      onSuccess?.(resData);
    } else {
      dispatch({ type: GET_ORDER_BY_ID_FAILURE, payload: resData.status.message });
      onError?.(resData.status.message);
    }
  } catch (error: any) {
    dispatch({ type: GET_ORDER_BY_ID_FAILURE, payload: error.message });
    onError?.(error.message);
  }
};

// Reset trạng thái order (dùng sau khi tạo order thành công)
export const resetOrderStateAction = () => (dispatch: Dispatch<any>) => {
  dispatch({ type: RESET_ORDER_STATE });
};
