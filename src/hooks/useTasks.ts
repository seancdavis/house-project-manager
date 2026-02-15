import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/tasks';
import { useToast } from '../context/ToastContext';
import { useCurrentUser } from '../context/UserContext';
import type { Task, TaskInput } from '../types';

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
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (taskIds: string[]) => api.reorderTasks(taskIds),
    onMutate: async (taskIds: string[]) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      // Snapshot previous tasks for rollback
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);

      // Optimistically update the cache with the new order
      if (previousTasks) {
        const taskMap = new Map(previousTasks.map(t => [t.id, t]));
        const reorderedTasks = taskIds
          .map((id, index) => {
            const task = taskMap.get(id);
            return task ? { ...task, sortOrder: index } : null;
          })
          .filter((t): t is Task => t !== null);

        // Include done tasks that weren't in the reorder list
        const doneTasks = previousTasks.filter(t => t.status === 'done');
        const newTasks = [...reorderedTasks, ...doneTasks];

        queryClient.setQueryData(['tasks', projectId], newTasks);
      }

      return { previousTasks };
    },
    onError: (_error: Error, _taskIds: string[], context) => {
      // Rollback to previous state on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      showToast('Failed to reorder tasks', 'error');
    },
    onSettled: () => {
      // Refetch after mutation settles to ensure server state is in sync
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}
