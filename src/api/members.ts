import { get, post, put, del } from './client';
import type { Member, MemberInput } from '../types';

export function getMembers(): Promise<Member[]> {
  return get<Member[]>('/members');
}

export function getMember(id: string): Promise<Member> {
  return get<Member>(`/members/${id}`);
}

export function createMember(data: MemberInput & { actorId?: string }): Promise<Member> {
  return post<Member>('/members', data);
}

export function updateMember(id: string, data: MemberInput & { actorId?: string }): Promise<Member> {
  return put<Member>(`/members/${id}`, data);
}

export function deleteMember(id: string, actorId?: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/members/${id}`, actorId ? { actorId } : undefined);
}
