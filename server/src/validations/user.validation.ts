import { rolesAllowed } from '@/config';
import z from 'zod';
import { isObjectId, isPassword } from './custom.validation';

const createUser = {
  body: z.object({
    email: z.email(),
    password: isPassword,
    name: z.string(),
    role: z.enum(rolesAllowed),
  }),
};

const getUsers = {
  query: z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
};

const updateProfile = {
  body: z
    .object({
      name: z.string().optional(),
      newPassword: isPassword.optional(),
      oldPassword: isPassword.optional(),
    })
    .refine((data) => (!data.newPassword && !data.oldPassword) || (data.newPassword && data.oldPassword), {
      message: 'Both oldPassword and newPassword must be provided together',
      path: ['newPassword'],
    }),
};

const getUser = {
  params: z.object({
    userId: isObjectId,
  }),
};

const updateUser = {
  params: z.object({
    userId: isObjectId,
  }),
  body: z
    .object({
      email: z.email().optional(),
      password: isPassword.optional(),
      name: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
};

const deleteUser = {
  params: z.object({
    userId: isObjectId,
  }),
};

export default {
  createUser,
  getUsers,
  updateProfile,
  getUser,
  updateUser,
  deleteUser,
};
