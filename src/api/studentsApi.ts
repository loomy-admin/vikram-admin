import apiClient from './axios';
import { ApiResponse, PaginatedResponse, Student, StudentStatus } from '../types';

export interface ListStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  schoolId?: number;
  classId?: number;
  status?: StudentStatus;
}

export const studentsApi = {
  async getStudents(params: ListStudentsParams = {}): Promise<PaginatedResponse<Student>> {
    const res = await apiClient.get<ApiResponse<any>>('/admin/students', { params });
    const data = res.data.data;
    const items: Student[] = data?.items || [];
    const total = data?.pagination?.total ?? items.length;
    const totalPages = data?.pagination?.totalPages ?? data?.pagination?.pages ?? 1;
    return {
      items,
      total,
      totalPages,
      pagination: data?.pagination || { page: params.page || 1, limit: params.limit || 10, total, pages: totalPages, totalPages },
    };
  },

  async getStudentById(id: number): Promise<Student> {
    const res = await apiClient.get<ApiResponse<Student>>(`/admin/students/${id}`);
    return res.data.data!;
  },

  async updateStudentStatus(id: number, status: StudentStatus): Promise<Student> {
    const res = await apiClient.patch<ApiResponse<Student>>(`/admin/students/${id}/status`, { status });
    return res.data.data!;
  },

  async updateStatus(id: number, status: StudentStatus): Promise<Student> {
    return this.updateStudentStatus(id, status);
  },
};

