import { get, post, put, del } from './client';
import type { Note } from '../types';

export function getProjectNotes(projectId: string): Promise<Note[]> {
  return get<Note[]>(`/notes?projectId=${projectId}`);
}

export function getTaskNotes(taskId: string): Promise<Note[]> {
  return get<Note[]>(`/notes?taskId=${taskId}`);
}

export function createNote(data: {
  projectId?: string;
  taskId?: string;
  content: string;
  authorId?: string;
}): Promise<Note> {
  return post<Note>('/notes', data);
}

export function updateNote(id: string, content: string): Promise<Note> {
  return put<Note>(`/notes/${id}`, { content });
}

export function deleteNote(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/notes/${id}`);
}
