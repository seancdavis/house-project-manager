import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/tasks';
import { useToast } from '../context/ToastContext';
import { useCurrentUser } from '../context/UserContext';
import type { TaskInput } from '../types';

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.getTasks(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: (data: Omit<TaskInput, 'projectId'>) => api.createTask(projectId, { ...data, actorId: currentUser?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Task created');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to create task', 'error');
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskInput> }) =>
      api.updateTask(id, { ...data, actorId: currentUser?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Task updated');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update task', 'error');
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id, currentUser?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Task deleted');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to delete task', 'error');
    },
  });
}

export function useReorderTasks(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskIds: string[]) => api.reorderTasks(taskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}
