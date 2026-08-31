import apiClient from './axios';
import { ApiResponse, AdminUser } from '../types';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: AdminUser;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  async login(payload: AdminLoginPayload): Promise<AdminLoginResponse> {
    const res = await apiClient.post<ApiResponse<any>>('/auth/admin/login', payload);
    const data = res.data.data;
    const token = data?.token;
    const user = data?.user || data?.admin;
    return { token, user };
  },

  async getProfile(): Promise<AdminUser> {
    const res = await apiClient.get<ApiResponse<any>>('/auth/admin/me');
    const data = res.data.data;
    return data?.user || data?.admin || data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/admin/change-password', payload);
  },
};

