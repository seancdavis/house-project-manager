import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/members';
import { useToast } from '../context/ToastContext';
import { useCurrentUser } from '../context/UserContext';
import type { MemberInput } from '../types';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: api.getMembers,
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => api.getMember(id),
    enabled: !!id,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: (data: MemberInput) => api.createMember({ ...data, actorId: currentUser?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Member created');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to create member', 'error');
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberInput }) =>
      api.updateMember(id, { ...data, actorId: currentUser?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Member updated');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update member', 'error');
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { currentUser } = useCurrentUser();
  return useMutation({
    mutationFn: (id: string) => api.deleteMember(id, currentUser?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showToast('Member deleted');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to delete member', 'error');
    },
  });
}
