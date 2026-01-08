export type MemberType = 'family' | 'contractor';

export interface Member {
  id: string;
  name: string;
  type: MemberType;
  initials: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = 'diy' | 'contractor' | 'handyman';
export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  ownerId: string | null;
  implementerId: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  assigneeId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

// Form input types (without generated fields)
export interface MemberInput {
  name: string;
  type: MemberType;
  initials: string;
  color: string;
}

export interface ProjectInput {
  title: string;
  description?: string;
  type: ProjectType;
  status?: ProjectStatus;
  ownerId?: string;
  implementerId?: string;
  targetDate?: string;
}

export interface TaskInput {
  projectId: string;
  title: string;
  status?: TaskStatus;
  assigneeId?: string;
  sortOrder?: number;
}
