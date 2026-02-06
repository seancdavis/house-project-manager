import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/projects';
import { useToast } from '../context/ToastContext';
import { useCurrentUser } from '../context/UserContext';
import type { ProjectInput } from '../types';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: (data: ProjectInput) => api.createProject({ ...data, actorId: currentUser?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Project created');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to create project', 'error');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectInput> }) =>
      api.updateProject(id, { ...data, actorId: currentUser?.id }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Project updated');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update project', 'error');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id, currentUser?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Project deleted');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to delete project', 'error');
    },
  });
}
