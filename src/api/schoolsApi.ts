import apiClient from './axios';
import { ApiResponse, PaginatedResponse, School, SchoolStatus, Student, AccessCode, CreateSchoolPayload, UpdateSchoolPayload } from '../types';

export interface ListSchoolsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SchoolStatus;
}

export const schoolsApi = {
  async getSchools(params: ListSchoolsParams = {}): Promise<PaginatedResponse<School>> {
    const res = await apiClient.get<ApiResponse<any>>('/admin/schools', { params });
    const data = res.data.data;
    const items: School[] = (data?.items || []).map((s: any) => ({
      ...s,
      studentsCount: s._count?.students ?? s.studentsCount ?? 0,
      totalCodes: s._count?.accessCodes ?? s.totalCodes ?? 0,
      usedCodes: s.usedCodes ?? 0,
      unusedCodes: s.unusedCodes ?? (s._count?.accessCodes ?? 0) - (s.usedCodes ?? 0),
    }));
    const total = data?.pagination?.total ?? items.length;
    const totalPages = data?.pagination?.totalPages ?? data?.pagination?.pages ?? 1;
    return {
      items,
      total,
      totalPages,
      pagination: data?.pagination || { page: params.page || 1, limit: params.limit || 10, total, pages: totalPages, totalPages },
    };
  },

  async getSchoolById(id: number): Promise<School> {
    const res = await apiClient.get<ApiResponse<any>>(`/admin/schools/${id}`);
    const s = res.data.data;
    return {
      ...s,
      studentsCount: s._count?.students ?? s.studentsCount ?? 0,
      totalCodes: s._count?.accessCodes ?? s.totalCodes ?? 0,
      usedCodes: s.usedCodes ?? 0,
      unusedCodes: s.unusedCodes ?? (s._count?.accessCodes ?? 0) - (s.usedCodes ?? 0),
    };
  },

  async createSchool(payload: CreateSchoolPayload): Promise<School> {
    const res = await apiClient.post<ApiResponse<School>>('/admin/schools', payload);
    return res.data.data!;
  },

  async updateSchool(id: number, payload: UpdateSchoolPayload): Promise<School> {
    const res = await apiClient.put<ApiResponse<School>>(`/admin/schools/${id}`, payload);
    return res.data.data!;
  },

  async updateSchoolStatus(id: number, status: SchoolStatus): Promise<School> {
    const res = await apiClient.patch<ApiResponse<School>>(`/admin/schools/${id}/status`, { status });
    return res.data.data!;
  },

  async getSchoolStudents(id: number, page = 1, limit = 10): Promise<PaginatedResponse<Student>> {
    const res = await apiClient.get<ApiResponse<any>>(`/admin/schools/${id}/students`, {
      params: { page, limit },
    });
    const data = res.data.data;
    const items: Student[] = data?.items || [];
    const total = data?.pagination?.total ?? items.length;
    const totalPages = data?.pagination?.totalPages ?? data?.pagination?.pages ?? 1;
    return {
      items,
      total,
      totalPages,
      pagination: data?.pagination || { page, limit, total, pages: totalPages, totalPages },
    };
  },

  async getSchoolAccessCodes(id: number, page = 1, limit = 10): Promise<PaginatedResponse<AccessCode>> {
    const res = await apiClient.get<ApiResponse<any>>(`/admin/schools/${id}/access-codes`, {
      params: { page, limit },
    });
    const data = res.data.data;
    const items: AccessCode[] = data?.items || [];
    const total = data?.pagination?.total ?? items.length;
    const totalPages = data?.pagination?.totalPages ?? data?.pagination?.pages ?? 1;
    return {
      items,
      total,
      totalPages,
      pagination: data?.pagination || { page, limit, total, pages: totalPages, totalPages },
    };
  },
};

