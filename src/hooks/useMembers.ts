import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/members';
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
  return useMutation({
    mutationFn: (data: MemberInput) => api.createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberInput }) =>
      api.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
