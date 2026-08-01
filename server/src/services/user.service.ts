import User from '@/models/user.model';
import type { CreateUserPaylaod, IUser, PaginationFilters, PaginationOptions, UpdatePasswordPayload } from '@/types';
import { ApiError } from '@/utils';
import { comparePassword } from '@/utils/password-hash';
import httpStatus from 'http-status';

const isEmailTaken = async (email: string, excludeUserId?: string) => {
  const user = await User.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

const createUser = async (userBody: CreateUserPaylaod) => {
  if (await isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

const queryUsers = async (options: PaginationOptions, filters: PaginationFilters<IUser>) => {
  return await User.paginate(options, filters);
};

const getUserById = async (id: string) => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

const updatePassword = async (userId: string, requestBody: UpdatePasswordPayload) => {
  const { oldPassword, newPassword } = requestBody;
  const user = await getUserById(userId);
  if (!(await comparePassword(oldPassword, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }
  const updatedUser = await updateUserById(userId, { password: newPassword });
  return updatedUser;
};

const updateUserById = async (userId: string, updateBody: Partial<IUser>) => {
  const user = await getUserById(userId);

  if (updateBody.email && (await isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId: string) => {
  const user = await User.findOneAndDelete({ _id: userId });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

export default {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updatePassword,
  updateUserById,
  deleteUserById,
};
