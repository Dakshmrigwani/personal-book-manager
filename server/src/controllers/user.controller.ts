import userService from '@/services/user.service';
import type { AuthedReq } from '@/types';
import type { GetUsersQuery, UpdateProfileBody } from '@/types/validation.types';
import { pick } from '@/utils';
import type { RequestHandler } from 'express';
import httpStatus from 'http-status';

const createUser: RequestHandler = async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
};

const getUsers: RequestHandler = async (req, res) => {
  const query = req.query as GetUsersQuery;
  const filter = pick(query, ['name', 'role']);
  const options = pick(query, ['sortBy', 'limit', 'page']);

  const result = await userService.queryUsers(options, filter);
  res.send(result);
};

const getUserProfile: RequestHandler = async (req, res) => {
  const userId = (req as AuthedReq).user.id;
  const user = await userService.getUserById(userId);
  res.status(httpStatus.OK).send(user);
};

const updateUserProfile: RequestHandler = async (req, res) => {
  const { id: userId } = (req as AuthedReq).user;
  const { newPassword, oldPassword, ...rest } = req.body as UpdateProfileBody;

  const updatedUser =
    newPassword && oldPassword
      ? await userService.updatePassword(userId, {
          newPassword,
          oldPassword,
        })
      : await userService.updateUserById(userId, rest);

  res.send(updatedUser);
};

const getUser: RequestHandler = async (req, res) => {
  const userId = req.params.userId as string;
  const user = await userService.getUserById(userId);
  res.send(user);
};

const updateUser: RequestHandler = async (req, res) => {
  const userId = req.params.userId as string;
  const user = await userService.updateUserById(userId, req.body);
  res.send(user);
};

const deleteUser: RequestHandler = async (req, res) => {
  const userId = req.params.userId as string;
  await userService.deleteUserById(userId);
  res.status(httpStatus.NO_CONTENT).send();
};

export default {
  createUser,
  getUsers,
  getUserProfile,
  updateUserProfile,
  getUser,
  updateUser,
  deleteUser,
};
