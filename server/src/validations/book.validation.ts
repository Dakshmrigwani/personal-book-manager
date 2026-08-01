import z from 'zod';
import { isObjectId } from './custom.validation';

const statusEnum = z.enum(['want-to-read', 'reading', 'completed', 'dnf']);

const createBook = {
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    author: z.string().min(1, { message: 'Author is required' }),
    status: statusEnum.optional(),
    tags: z.array(isObjectId).optional(),
    rating: z.number().min(0).max(5).optional(),
    pages: z.number().min(0).optional(),
    coverImage: z.string().url().or(z.string().min(1)).optional(),
    description: z.string().optional(),
  }),
};

const getBooks = {
  query: z.object({
    search: z.string().optional(),
    status: statusEnum.optional(),
    tag: isObjectId.optional(),
    sortBy: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
};

const getBook = {
  params: z.object({
    bookId: isObjectId,
  }),
};

const updateBook = {
  params: z.object({
    bookId: isObjectId,
  }),
  body: z
    .object({
      title: z.string().min(1).optional(),
      author: z.string().min(1).optional(),
      status: statusEnum.optional(),
      tags: z.array(isObjectId).optional(),
      rating: z.number().min(0).max(5).optional(),
      pages: z.number().min(0).optional(),
      coverImage: z.string().url().or(z.string().min(1)).optional(),
      description: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
};

const deleteBook = {
  params: z.object({
    bookId: isObjectId,
  }),
};

export default {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
};
