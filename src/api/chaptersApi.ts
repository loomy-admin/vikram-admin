import apiClient from './axios';
import { ApiResponse, ChapterItem, CreateChapterPayload, UpdateChapterPayload, ChapterStatus } from '../types';

export interface ListChaptersParams {
  subjectId?: number;
  status?: ChapterStatus;
}

export const chaptersApi = {
  async getChapters(params: ListChaptersParams = {}): Promise<ChapterItem[]> {
    const res = await apiClient.get<ApiResponse<ChapterItem[]>>('/admin/chapters', { params });
    return res.data.data || [];
  },

  async getChaptersBySubject(subjectId: number): Promise<ChapterItem[]> {
    return this.getChapters({ subjectId });
  },

  async getChapterById(id: number): Promise<ChapterItem> {
    const res = await apiClient.get<ApiResponse<ChapterItem>>(`/admin/chapters/${id}`);
    return res.data.data!;
  },

  async createChapter(payload: CreateChapterPayload): Promise<ChapterItem> {
    const res = await apiClient.post<ApiResponse<ChapterItem>>('/admin/chapters', payload);
    return res.data.data!;
  },

  async updateChapter(id: number, payload: UpdateChapterPayload): Promise<ChapterItem> {
    const res = await apiClient.put<ApiResponse<ChapterItem>>(`/admin/chapters/${id}`, payload);
    return res.data.data!;
  },

  async deleteChapter(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/chapters/${id}`);
  },
};

