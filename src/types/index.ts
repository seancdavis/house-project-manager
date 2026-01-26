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
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority | null;
  ownerId: string | null;
  implementerId: string | null;
  targetDate: string | null;
  estimatedBudget: number | null; // in cents
  actualBudget: number | null; // in cents
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  tags?: Tag[]; // populated from join
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

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  projectId: string;
  blobKey: string;
  filename: string;
  caption: string | null;
  mimeType: string;
  size: number;
  uploadedById: string | null;
  createdAt: string;
  url?: string; // Populated from Netlify Image CDN
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
  priority?: ProjectPriority | null;
  ownerId?: string;
  implementerId?: string;
  targetDate?: string;
  estimatedBudget?: number | null;
  actualBudget?: number | null;
  tagIds?: string[];
}

export interface TaskInput {
  projectId: string;
  title: string;
  status?: TaskStatus;
  assigneeId?: string;
  sortOrder?: number;
}
