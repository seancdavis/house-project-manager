import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/activities';
import type { ActivityAction, ActivityEntityType } from '../types';

export function useActivities(options?: { limit?: number; projectId?: string }) {
  return useQuery({
    queryKey: ['activities', options],
    queryFn: () => api.getActivities(options),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      action: ActivityAction;
      entityType: ActivityEntityType;
      entityId?: string;
      entityTitle?: string;
      projectId?: string;
      actorId?: string;
      metadata?: Record<string, unknown>;
    }) => api.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
