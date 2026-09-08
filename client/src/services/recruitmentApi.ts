import type {
  DepartmentMembersResponse,
  DepartmentsResponse,
  SystemStatusResponse,
  WhoAmIResponse,
} from '@/types/recruitment';

const API_BASE = '/api';

export const recruitmentApi = {
  async getDepartments(): Promise<DepartmentsResponse> {
    const response = await fetch(`${API_BASE}/departments`);
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    return response.json();
  },

  async getDepartmentMembers(department: string): Promise<DepartmentMembersResponse> {
    const response = await fetch(`${API_BASE}/departments/${encodeURIComponent(department)}/members`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Department not found');
      }
      throw new Error('Failed to fetch department members');
    }
    return response.json();
  },

  async getStatus(): Promise<SystemStatusResponse> {
    const response = await fetch(`${API_BASE}/status`);
    if (!response.ok) {
      throw new Error('Failed to fetch system status');
    }
    return response.json();
  },

  async whoami(): Promise<WhoAmIResponse> {
    const response = await fetch(`${API_BASE}/whoami`);
    if (!response.ok) {
      throw new Error('Failed to fetch user identity');
    }
    return response.json();
  },
};
