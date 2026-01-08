import { get, post, put, del } from './client';
import type { Project, ProjectInput } from '../types';

export function getProjects(): Promise<Project[]> {
  return get<Project[]>('/projects');
}

export function getProject(id: string): Promise<Project> {
  return get<Project>(`/projects/${id}`);
}

export function createProject(data: ProjectInput): Promise<Project> {
  return post<Project>('/projects', data);
}

export function updateProject(id: string, data: Partial<ProjectInput>): Promise<Project> {
  return put<Project>(`/projects/${id}`, data);
}

export function deleteProject(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/projects/${id}`);
}
