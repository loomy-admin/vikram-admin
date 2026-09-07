import apiClient from './axios';
import {
  ApiResponse,
  ContentItem,
  ContentType,
  ContentStatus,
  PaginatedResponse,
  ClassItem,
  CreateContentPayload,
  UpdateContentPayload,
} from '../types';

export interface ListContentParams {
  topicId?: number;
  chapterId?: number;
  type?: ContentType;
  status?: ContentStatus;
  page?: number;
  limit?: number;
}

export interface FileUploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export const contentApi = {
  async getClasses(): Promise<ClassItem[]> {
    const res = await apiClient.get<ApiResponse<ClassItem[]>>('/admin/classes');
    return res.data.data || [];
  },

  async createClass(payload: { name: string; grade: number; status?: string }): Promise<ClassItem> {
    const res = await apiClient.post<ApiResponse<ClassItem>>('/admin/classes', payload);
    return res.data.data!;
  },

  async updateClass(id: number, payload: { name?: string; grade?: number; status?: string }): Promise<ClassItem> {
    const res = await apiClient.put<ApiResponse<ClassItem>>(`/admin/classes/${id}`, payload);
    return res.data.data!;
  },

  async deleteClass(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/classes/${id}`);
  },

  async getContent(params: ListContentParams = {}): Promise<PaginatedResponse<ContentItem>> {
    const res = await apiClient.get<ApiResponse<any>>('/admin/content', { params });
    const data = res.data.data;
    const items: ContentItem[] = data?.items || [];
    const total = data?.pagination?.total ?? items.length;
    const totalPages = data?.pagination?.totalPages ?? data?.pagination?.pages ?? 1;
    return {
      items,
      total,
      totalPages,
      pagination: data?.pagination || { page: params.page || 1, limit: params.limit || 10, total, pages: totalPages, totalPages },
    };
  },

  async getContentByTopic(topicId: number): Promise<ContentItem[]> {
    const res = await this.getContent({ topicId, limit: 100 });
    return res.items;
  },

  async getContentByChapter(chapterId: number): Promise<ContentItem[]> {
    const res = await this.getContent({ chapterId, limit: 100 });
    return res.items;
  },

  async getContentById(id: number): Promise<ContentItem> {
    const res = await apiClient.get<ApiResponse<ContentItem>>(`/admin/content/${id}`);
    return res.data.data!;
  },

  async createContent(payload: CreateContentPayload): Promise<ContentItem> {
    const res = await apiClient.post<ApiResponse<ContentItem>>('/admin/content', payload);
    return res.data.data!;
  },

  async updateContent(id: number, payload: UpdateContentPayload): Promise<ContentItem> {
    const res = await apiClient.put<ApiResponse<ContentItem>>(`/admin/content/${id}`, payload);
    return res.data.data!;
  },

  async updateVisibility(id: number, status: ContentStatus): Promise<ContentItem> {
    const res = await apiClient.patch<ApiResponse<ContentItem>>(`/admin/content/${id}/visibility`, { status });
    return res.data.data!;
  },

  async deleteContent(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/content/${id}`);
  },

  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ApiResponse<FileUploadResult>>('/admin/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return res.data.data!;
  },

  async uploadImage(file: File, onProgress?: (percent: number) => void): Promise<{ url: string; publicId?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ApiResponse<{ url: string; publicId?: string }>>('/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return res.data.data!;
  },
};

