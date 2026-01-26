import { get, post } from './client';
import type { Tag } from '../types';

export function getTags(): Promise<Tag[]> {
  return get<Tag[]>('/tags');
}

export function createTag(name: string): Promise<Tag> {
  return post<Tag>('/tags', { name });
}
