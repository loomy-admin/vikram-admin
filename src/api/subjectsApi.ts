import apiClient from './axios';
import { ApiResponse, ClassItem, SubjectItem, CreateSubjectPayload, UpdateSubjectPayload, SubjectStatus } from '../types';

export interface ListSubjectsParams {
  classId?: number;
  status?: SubjectStatus;
}

export const subjectsApi = {
  async getClasses(): Promise<ClassItem[]> {
    const res = await apiClient.get<ApiResponse<ClassItem[]>>('/admin/classes');
    return res.data.data || [];
  },

  async getSubjects(params: ListSubjectsParams = {}): Promise<SubjectItem[]> {
    const res = await apiClient.get<ApiResponse<SubjectItem[]>>('/admin/subjects', { params });
    return res.data.data || [];
  },

  async getSubjectsByClass(classId: number): Promise<SubjectItem[]> {
    return this.getSubjects({ classId });
  },

  async getSubjectById(id: number): Promise<SubjectItem> {
    const res = await apiClient.get<ApiResponse<SubjectItem>>(`/admin/subjects/${id}`);
    return res.data.data!;
  },

  async createSubject(payload: CreateSubjectPayload): Promise<SubjectItem> {
    const res = await apiClient.post<ApiResponse<SubjectItem>>('/admin/subjects', payload);
    return res.data.data!;
  },

  async updateSubject(id: number, payload: UpdateSubjectPayload): Promise<SubjectItem> {
    const res = await apiClient.put<ApiResponse<SubjectItem>>(`/admin/subjects/${id}`, payload);
    return res.data.data!;
  },

  async deleteSubject(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/subjects/${id}`);
  },
};

