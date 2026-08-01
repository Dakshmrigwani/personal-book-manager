import { apiFetch } from './api';
import type { Tag } from './tags-api';

export type BookStatus = 'want-to-read' | 'reading' | 'completed' | 'dnf';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  tags: Tag[];
  rating?: number;
  pages?: number;
  coverImage?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBooks {
  results: Book[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface BookStats {
  total: number;
  wantToRead: number;
  reading: number;
  completed: number;
  dnf: number;
}

export async function fetchBooks(params: {
  search?: string;
  status?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<PaginatedBooks> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.tag) query.set('tag', params.tag);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.sortBy) query.set('sortBy', params.sortBy);

  return apiFetch<PaginatedBooks>(`/books?${query.toString()}`);
}

export async function fetchBookStats(): Promise<BookStats> {
  return apiFetch<BookStats>('/books/stats');
}

export async function createBook(data: {
  title: string;
  author: string;
  status?: BookStatus;
  tags?: string[];
  rating?: number;
  pages?: number;
  coverImage?: string;
  description?: string;
}): Promise<Book> {
  return apiFetch<Book>('/books', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBook(
  id: string,
  data: Partial<{
    title: string;
    author: string;
    status: BookStatus;
    tags: string[];
    rating: number;
    pages: number;
    coverImage: string;
    description: string;
  }>,
): Promise<Book> {
  return apiFetch<Book>(`/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteBook(id: string): Promise<void> {
  return apiFetch<void>(`/books/${id}`, {
    method: 'DELETE',
  });
}
