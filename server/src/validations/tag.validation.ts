import z from 'zod';
import { isObjectId } from './custom.validation';

const createTag = {
  body: z.object({
    name: z.string().min(1, { message: 'Tag name is required' }).max(50),
    color: z.string().optional(),
  }),
};

const getTags = {
  query: z.object({
    name: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
};

const getTag = {
  params: z.object({
    tagId: isObjectId,
  }),
};

const updateTag = {
  params: z.object({
    tagId: isObjectId,
  }),
  body: z
    .object({
      name: z.string().min(1).max(50).optional(),
      color: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
};

const deleteTag = {
  params: z.object({
    tagId: isObjectId,
  }),
};

export default {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag,
};
