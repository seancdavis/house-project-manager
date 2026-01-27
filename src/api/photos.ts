import { get, del, patch } from './client';
import type { Photo } from '../types';

export async function getPhotos(projectId: string): Promise<Photo[]> {
  return get<Photo[]>(`/projects/${projectId}/photos`);
}

// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

export async function uploadPhoto(
  projectId: string,
  file: File,
  caption?: string,
  uploadedById?: string
): Promise<Photo> {
  const base64 = await fileToBase64(file);

  const response = await fetch(`/api/projects/${projectId}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: base64,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      caption,
      uploadedById,
    }),
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
