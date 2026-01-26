import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/notes';

export function useProjectNotes(projectId: string) {
  return useQuery({
    queryKey: ['notes', 'project', projectId],
    queryFn: () => api.getProjectNotes(projectId),
    enabled: !!projectId,
  });
}

export function useTaskNotes(taskId: string) {
  return useQuery({
    queryKey: ['notes', 'task', taskId],
    queryFn: () => api.getTaskNotes(taskId),
    enabled: !!taskId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      projectId?: string;
      taskId?: string;
      content: string;
      authorId?: string;
    }) => api.createNote(data),
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['notes', 'project', variables.projectId] });
      }
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: ['notes', 'task', variables.taskId] });
      }
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
