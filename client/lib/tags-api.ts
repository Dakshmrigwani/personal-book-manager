import { apiFetch } from './api';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface PaginatedTags {
  results: Tag[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export async function fetchTags(nameFilter?: string): Promise<PaginatedTags> {
  const query = new URLSearchParams({ limit: '100' });
  if (nameFilter) query.set('name', nameFilter);
  return apiFetch<PaginatedTags>(`/tags?${query.toString()}`);
}

export async function createTag(data: { name: string; color?: string }): Promise<Tag> {
  return apiFetch<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTag(id: string, data: { name?: string; color?: string }): Promise<Tag> {
  return apiFetch<Tag>(`/tags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTag(id: string): Promise<void> {
  return apiFetch<void>(`/tags/${id}`, {
    method: 'DELETE',
  });
}
