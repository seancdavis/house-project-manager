import { get, post } from './client';
import type { Activity, ActivityAction, ActivityEntityType } from '../types';

export function getActivities(options?: { limit?: number; projectId?: string }): Promise<Activity[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.projectId) params.set('projectId', options.projectId);
  const query = params.toString();
  return get<Activity[]>(`/activities${query ? `?${query}` : ''}`);
}

export function createActivity(data: {
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string;
  entityTitle?: string;
  projectId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}): Promise<Activity> {
  return post<Activity>('/activities', data);
}
