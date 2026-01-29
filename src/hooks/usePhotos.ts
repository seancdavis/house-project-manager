import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/photos';
import { useToast } from '../context/ToastContext';

export function usePhotos(projectId: string) {
  return useQuery({
    queryKey: ['photos', projectId],
    queryFn: () => api.getPhotos(projectId),
    enabled: !!projectId,
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({
      projectId,
      file,
      caption,
      uploadedById,
    }: {
      projectId: string;
      file: File;
      caption?: string;
      uploadedById?: string;
    }) => api.uploadPhoto(projectId, file, caption, uploadedById),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['photos', projectId] });
      showToast('Photo uploaded');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to upload photo', 'error');
    },
  });
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { caption?: string; filename?: string } }) =>
      api.updatePhoto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      showToast('Photo updated');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update photo', 'error');
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => api.deletePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      showToast('Photo deleted');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to delete photo', 'error');
    },
  });
}
