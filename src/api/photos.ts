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

// Max file size before base64 encoding (~4.5MB to stay under 6MB limit after encoding)
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export async function uploadPhoto(
  projectId: string,
  file: File,
  caption?: string,
  uploadedById?: string
): Promise<Photo> {
  // Validate file size before encoding
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`);
  }

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

export function updatePhoto(id: string, data: { caption?: string; filename?: string }): Promise<Photo> {
  return patch<Photo>(`/photos/${id}`, data);
}

export function deletePhoto(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/photos/${id}`);
}
