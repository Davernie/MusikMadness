import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { StreamerUser } from '../types/streams';

const getDefaultHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

class UserService {
  // Get all users from the database
  async getAllUsers(page: number = 1, limit: number = 50): Promise<{ users: StreamerUser[]; pagination: any }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
        headers: getDefaultHeaders(),
      });
      
      // Transform the response to match our StreamerUser interface
      const users = response.data.users.map((user: any) => ({
        id: user._id,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
        bio: user.bio,
        location: user.location,
        socials: user.socials,
      }));

      return {
        users,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get users that have streaming platform social links (using dedicated endpoint)
  async getStreamingUsers(): Promise<StreamerUser[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/streamers`, {
        headers: getDefaultHeaders(),
      });
      
      // Transform the response to match our StreamerUser interface
      const users = response.data.users.map((user: any) => ({
        id: user._id,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
        bio: user.bio,
        location: user.location,
        socials: user.socials,
      }));

      return users;
    } catch (error) {
      console.error('Error fetching streaming users:', error);
      
      // Fallback to filtering all users
      try {
        const { users } = await this.getAllUsers(1, 100);
        return users.filter(user => 
          user.socials?.youtube || 
          user.socials?.soundcloud ||
          user.socials?.instagram ||
          user.socials?.twitter
        );
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // Get a specific user by ID
  async getUserById(userId: string): Promise<StreamerUser | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: getDefaultHeaders(),
      });
      
      return {
        id: response.data._id,
        username: response.data.username,
        profilePictureUrl: response.data.profilePictureUrl,
        bio: response.data.bio,
        location: response.data.location,
        socials: response.data.socials,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}

export default new UserService(); 