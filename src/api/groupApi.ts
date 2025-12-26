// src/api/groupApi.ts
import { api } from '../api';

// Types
export interface Group {
  id: string;
  groupName : string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  devices?: Array<{
    id: string;
    device_id: string;
    device_name: string;
    sn: string;
  }>;
}

export interface GroupUser {
  user_id: string;
  group_id: string;
  is_allowed: boolean;
}

export interface PaginationResponse {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
}

export interface GroupResponse {
  data: Group[];
  pagination: PaginationResponse;
}

// API Functions
export const getGroups = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return api.get('/api/group', { params: params || {} });
};

export const getGroupById = async (id: string) => {
  return api.get(`/api/group/${id}`);
};

export const createGroup = (data: Omit<Group, 'id'>) => {
  return api.post('/api/group', data);
};

export const updateGroup = (id: string, data: Partial<Group>) => {
  return api.put(`/api/group/${id}`, data);
};

export const deleteGroup = (id: string, hardDelete: boolean = false) => {
  return api.delete(`/api/group/${id}${hardDelete ? '?hard=true' : ''}`);
};

export const createGroupUsers = (data: { user_id: string; group_ids: string[] }) => {
  return api.post('/api/group/add-group', data);
};

export const deleteGroupByUser = (groupId: string) => {
  return api.delete(`/api/group/members/${groupId}`);
};

// Group membership management
export const getGroupMembers = (groupId: string) => {
  return api.get(`/api/group/${groupId}/members`);
};

export const addGroupMember = (groupId: string, userId: string) => {
  return api.post(`/api/group/${groupId}/members`, { user_id: userId });
};

export const updateGroupMember = (membershipId: string, data: { is_allowed: boolean }) => {
  return api.put(`/api/group/members/${membershipId}`, data);
};

export const removeGroupMember = (membershipId: string) => {
  return api.delete(`/api/group/members/${membershipId}`);
};