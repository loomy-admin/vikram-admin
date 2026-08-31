import apiClient from './axios';
import { ApiResponse, PaginatedResponse, AccessCode, AccessCodeStatus } from '../types';

export interface ListAccessCodesParams {
  page?: number;
  limit?: number;
  search?: string;
  schoolId?: number;
  status?: AccessCodeStatus;
  isUsed?: boolean;
}

export interface SingleCodeResult {
  code: string;
  schoolId: number;
  schoolName: string;
  status: AccessCodeStatus;
  createdAt: string;
}

export interface BulkCodesResult {
  schoolId: number;
  schoolName: string;
  totalGenerated: number;
  codes: Array<{
    id: number;
    code: string;
    status: AccessCodeStatus;
    createdAt: string;
  }>;
}

export const accessCodesApi = {
  async getAccessCodes(params: ListAccessCodesParams = {}): Promise<PaginatedResponse<AccessCode>> {
    const res = await apiClient.get<ApiResponse<any>>('/admin/access-codes', { params });
    const data = res.data.data;
    const items: AccessCode[] = data?.items || [];
    const total = data?.pagination?.total ?? items.length;
    const totalPages = data?.pagination?.totalPages ?? data?.pagination?.pages ?? 1;
    return {
      items,
      total,
      totalPages,
      pagination: data?.pagination || { page: params.page || 1, limit: params.limit || 10, total, pages: totalPages, totalPages },
    };
  },

  async getCodes(params: ListAccessCodesParams = {}): Promise<PaginatedResponse<AccessCode>> {
    return this.getAccessCodes(params);
  },

  async getAccessCodeById(id: number): Promise<AccessCode> {
    const res = await apiClient.get<ApiResponse<AccessCode>>(`/admin/access-codes/${id}`);
    return res.data.data!;
  },

  async generateSingle(schoolId: number): Promise<SingleCodeResult> {
    const res = await apiClient.post<ApiResponse<SingleCodeResult>>('/admin/access-codes', { schoolId });
    return res.data.data!;
  },

  async generateBulk(schoolId: number, quantity: number): Promise<BulkCodesResult> {
    const res = await apiClient.post<ApiResponse<BulkCodesResult>>('/admin/access-codes/bulk', {
      schoolId,
      quantity,
    });
    return res.data.data!;
  },

  async updateStatus(id: number, status: AccessCodeStatus): Promise<AccessCode> {
    const res = await apiClient.patch<ApiResponse<AccessCode>>(`/admin/access-codes/${id}/status`, { status });
    return res.data.data!;
  },

  async reassign(id: number, schoolId: number): Promise<AccessCode> {
    const res = await apiClient.put<ApiResponse<AccessCode>>(`/admin/access-codes/${id}/reassign`, { schoolId });
    return res.data.data!;
  },

  async reassignCode(id: number, schoolId: number): Promise<AccessCode> {
    return this.reassign(id, schoolId);
  },
};

