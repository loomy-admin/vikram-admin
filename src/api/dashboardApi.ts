import apiClient from './axios';
import { ApiResponse, DashboardStats } from '../types';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return res.data.data!;
  },
};
