import { get, del, patch } from './client';
import type { Photo } from '../types';

export async function getPhotos(projectId: string): Promise<Photo[]> {
  return get<Photo[]>(`/projects/${projectId}/photos`);
}

export async function uploadPhoto(
  projectId: string,
  file: File,
  caption?: string,
  uploadedById?: string
): Promise<Photo> {
  const formData = new FormData();
  formData.append('file', file);
  if (caption) formData.append('caption', caption);
  if (uploadedById) formData.append('uploadedById', uploadedById);

  const response = await fetch(`/api/projects/${projectId}/photos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload photo');
  }

  return response.json();
}

export function updatePhoto(id: string, data: { caption?: string }): Promise<Photo> {
  return patch<Photo>(`/photos/${id}`, data);
}

export function deletePhoto(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/photos/${id}`);
}
