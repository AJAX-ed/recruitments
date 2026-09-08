export interface RecruitmentMember {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
  phone?: string;
  department: string;
  status?: string;
}

export interface DepartmentMembersResponse {
  department: string;
  members: RecruitmentMember[];
}

export interface DepartmentsResponse {
  departments: string[];
}

export interface SystemStatusResponse {
  coreSystem: string;
  database: string;
  recruitmentData: string;
  authentication: string;
  api: string;
  totalDepartments: number;
  currentDepartment: string | null;
  systemTime: string;
}

export interface WhoAmIResponse {
  user: string;
  role: string;
  access: string;
  session: string;
}

export type TerminalEntryType = 'input' | 'output' | 'error' | 'system';

export interface TerminalEntry {
  type: TerminalEntryType;
  content: string;
  timestamp: number;
}

export interface TerminalState {
  currentDepartment: string | null;
  history: TerminalEntry[];
  commandHistory: string[];
  commandHistoryIndex: number;
  isBootComplete: boolean;
}

export const DEPARTMENTS = ['Design', 'Tech', 'WebD', 'Outreach', 'SM', 'EM'] as const;
export type Department = typeof DEPARTMENTS[number];

export const isValidDepartment = (dept: string): dept is Department => {
  return DEPARTMENTS.includes(dept as Department);
};
