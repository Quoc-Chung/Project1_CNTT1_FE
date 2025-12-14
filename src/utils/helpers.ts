/**
 * Format price to Vietnamese currency format
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(price);
};

/**
 * Format date to Vietnamese date format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

/**
 * Get status badge configuration for orders
 * Supports both uppercase API statuses and lowercase mapped statuses
 */
export const getStatusBadge = (status: string): { color: string, text: string } => {
  const normalizedStatus = status.toUpperCase();
  
  const statusMap: { [key: string]: { color: string, text: string } } = {
    // API Statuses (uppercase)
    'COMPLETED': { color: 'bg-green-100 text-green-800', text: 'Đã hoàn thành' },
    'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'Đang chờ thanh toán' },
    'PROCESSING': { color: 'bg-blue-100 text-blue-800', text: 'Đang xử lý' },
    'CONFIRMED': { color: 'bg-indigo-100 text-indigo-800', text: 'Đã xác nhận' },
    'SHIPPING': { color: 'bg-purple-100 text-purple-800', text: 'Đang giao hàng' },
    'DELIVERED': { color: 'bg-green-100 text-green-800', text: 'Đã giao hàng' },
    'CANCELLED': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
    'RETURNED': { color: 'bg-orange-100 text-orange-800', text: 'Đã trả hàng' },
    
    // Legacy lowercase statuses (for backward compatibility)
    'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
    'processing': { color: 'bg-blue-100 text-blue-800', text: 'Đang xử lý' },
    'shipped': { color: 'bg-purple-100 text-purple-800', text: 'Đã gửi' },
    'delivered': { color: 'bg-green-100 text-green-800', text: 'Đã giao' },
    'cancelled': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
  };
  
  return statusMap[normalizedStatus] || statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', text: status };
};

/**
 * Get role color for employees
 */
export const getRoleColor = (role: string): string => {
  const roleColors: { [key: string]: string } = {
    'Admin': 'bg-purple-500',
    'Manager': 'bg-blue-500',
    'Sales': 'bg-green-500',
    'Warehouse': 'bg-orange-500'
  };
  return roleColors[role] || 'bg-gray-500';
};

/**
 * Get role badge configuration for employees
 */
export const getRoleBadge = (role: string): { color: string, text: string } => {
  const roleMap: { [key: string]: { color: string, text: string } } = {
    'Admin': { color: 'bg-purple-100 text-purple-800', text: 'Quản trị viên' },
    'Manager': { color: 'bg-blue-100 text-blue-800', text: 'Quản lý' },
    'Sales': { color: 'bg-green-100 text-green-800', text: 'Bán hàng' },
    'Warehouse': { color: 'bg-orange-100 text-orange-800', text: 'Kho' }
  };
  return roleMap[role] || { color: 'bg-gray-100 text-gray-800', text: role };
};

/**
 * Get stock status configuration
 */
export const getStockStatus = (stock: number): { color: string, text: string, badgeColor: string } => {
  if (stock > 10) {
    return {
      color: 'text-green-600',
      text: 'Đủ hàng',
      badgeColor: 'bg-green-100 text-green-800'
    };
  } else if (stock > 0) {
    return {
      color: 'text-yellow-600',
      text: 'Sắp hết',
      badgeColor: 'bg-yellow-100 text-yellow-800'
    };
  } else {
    return {
      color: 'text-red-600',
      text: 'Hết hàng',
      badgeColor: 'bg-red-100 text-red-800'
    };
  }
};