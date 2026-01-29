import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/notes';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
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
      showToast('Note added');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to add note', 'error');
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      showToast('Note updated');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update note', 'error');
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      showToast('Note deleted');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to delete note', 'error');
    },
  });
}
