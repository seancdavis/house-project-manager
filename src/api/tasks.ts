import { get, post, put, del } from './client';
import type { Task, TaskInput } from '../types';

export function getTasks(projectId: string): Promise<Task[]> {
  return get<Task[]>(`/projects/${projectId}/tasks`);
}

export function getTask(id: string): Promise<Task> {
  return get<Task>(`/tasks/${id}`);
}

export function createTask(projectId: string, data: Omit<TaskInput, 'projectId'>): Promise<Task> {
  return post<Task>(`/projects/${projectId}/tasks`, data);
}

export function updateTask(id: string, data: Partial<TaskInput>): Promise<Task> {
  return put<Task>(`/tasks/${id}`, data);
}

export function deleteTask(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/tasks/${id}`);
}

export function reorderTasks(taskIds: string[]): Promise<{ success: boolean }> {
  return put<{ success: boolean }>('/tasks/reorder', { taskIds });
}
