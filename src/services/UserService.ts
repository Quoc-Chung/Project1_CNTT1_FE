import { BASE_API_AUTH_URL } from '@/utils/configAPI';
import { getCookie } from '@/utils/cookies';

export interface UserResponse {
  code: string;
  account: string;
  username: string | null;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  currentAddress: string | null;
  birthday: string | null;
  lastLogin: string | null;
  status: string;
}

export interface UsersApiResponse {
  status: {
    code: string;
    message: string;
    label?: string;
  };
  data: {
    content: UserResponse[];
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    current_page: number;
    total_elements: number;
  };
  extraData: any;
}

export class UserService {
  /**
   * Lấy tất cả user cho admin
   */
  static async getAllUsers(): Promise<UserResponse[]> {
    try {
      const token = getCookie('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_AUTH_URL}/api/v1/user/getAllUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: UsersApiResponse = await response.json();

      if (data.status.code === '200') {
        // Lọc ra user có username === "user1"
        const filteredUsers = (data.data.content || []).filter(
          (user) => user.username !== 'user1'
        );
        return filteredUsers;
      } else {
        throw new Error(data.status.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}

