import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/tags';
import { useToast } from '../context/ToastContext';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: api.getTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (name: string) => api.createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      showToast('Tag created');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to create tag', 'error');
    },
  });
}
