import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/photos';

export function usePhotos(projectId: string) {
  return useQuery({
    queryKey: ['photos', projectId],
    queryFn: () => api.getPhotos(projectId),
    enabled: !!projectId,
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
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
    },
  });
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { caption?: string } }) =>
      api.updatePhoto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}
