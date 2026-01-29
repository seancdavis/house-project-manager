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

// Max file size before base64 encoding (~4MB to stay safely under 6MB limit after encoding + JSON overhead)
const MAX_FILE_SIZE = 4 * 1024 * 1024;

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
    // Handle both JSON and text error responses
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload photo');
    } else {
      const text = await response.text();
      // Netlify returns "Internal Error. ID: ..." for payload too large
      if (text.includes('Internal Error') || response.status === 500) {
        throw new Error('Upload failed. The file may be too large for the server.');
      }
      throw new Error(text || 'Failed to upload photo');
    }
  }

  return response.json();
}

export function updatePhoto(id: string, data: { caption?: string; filename?: string }): Promise<Photo> {
  return patch<Photo>(`/photos/${id}`, data);
}

export function deletePhoto(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/photos/${id}`);
}
