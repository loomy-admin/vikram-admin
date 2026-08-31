import apiClient from './axios';
import { ApiResponse, AdminUser, AdminStatus, CreateAdminUserPayload, UpdateAdminUserPayload, PaginatedResponse } from '../types';

export interface ListAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const adminUsersApi = {
  async getAdminUsers(params: ListAdminUsersParams = {}): Promise<PaginatedResponse<AdminUser>> {
    const res = await apiClient.get<ApiResponse<AdminUser[]>>('/admin/users');
    let allUsers = res.data.data || [];
    if (params.search) {
      const q = params.search.toLowerCase();
      allUsers = allUsers.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const items = allUsers.slice((page - 1) * limit, page * limit);
    return {
      items,
      total,
      totalPages,
      pagination: { page, limit, total, totalPages, pages: totalPages },
    };
  },

  async getUsers(params: ListAdminUsersParams = {}): Promise<PaginatedResponse<AdminUser>> {
    return this.getAdminUsers(params);
  },

  async getAdminUserById(id: number): Promise<AdminUser> {
    const res = await apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
    return res.data.data!;
  },

  async createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
    const res = await apiClient.post<ApiResponse<AdminUser>>('/admin/users', payload);
    return res.data.data!;
  },

  async createUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
    return this.createAdminUser(payload);
  },

  async updateAdminUser(id: number, payload: UpdateAdminUserPayload): Promise<AdminUser> {
    const res = await apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, payload);
    return res.data.data!;
  },

  async updateUser(id: number, payload: UpdateAdminUserPayload): Promise<AdminUser> {
    return this.updateAdminUser(id, payload);
  },

  async updateAdminUserStatus(id: number, status: AdminStatus): Promise<AdminUser> {
    const res = await apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { status });
    return res.data.data!;
  },

  async deleteUser(id: number): Promise<void> {
    await this.updateAdminUserStatus(id, 'INACTIVE');
  },
};


