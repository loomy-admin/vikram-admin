import apiClient from './axios';
import { ApiResponse, TopicItem, CreateTopicPayload, UpdateTopicPayload, TopicStatus } from '../types';

export interface ListTopicsParams {
  chapterId?: number;
  status?: TopicStatus;
}

export const topicsApi = {
  async getTopics(params: ListTopicsParams = {}): Promise<TopicItem[]> {
    const res = await apiClient.get<ApiResponse<TopicItem[]>>('/admin/topics', { params });
    return res.data.data || [];
  },

  async getTopicsByChapter(chapterId: number): Promise<TopicItem[]> {
    return this.getTopics({ chapterId });
  },

  async getTopicById(id: number): Promise<TopicItem> {
    const res = await apiClient.get<ApiResponse<TopicItem>>(`/admin/topics/${id}`);
    return res.data.data!;
  },

  async createTopic(payload: CreateTopicPayload): Promise<TopicItem> {
    const res = await apiClient.post<ApiResponse<TopicItem>>('/admin/topics', payload);
    return res.data.data!;
  },

  async updateTopic(id: number, payload: UpdateTopicPayload): Promise<TopicItem> {
    const res = await apiClient.put<ApiResponse<TopicItem>>(`/admin/topics/${id}`, payload);
    return res.data.data!;
  },

  async deleteTopic(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/topics/${id}`);
  },
};

