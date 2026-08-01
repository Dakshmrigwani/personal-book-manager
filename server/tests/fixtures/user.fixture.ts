import mongoose from 'mongoose';
import { hashPassword } from '@/utils/password-hash';
import { faker } from '@faker-js/faker';
import User from '@/models/user.model';
import { IUser } from '@/types';

const password = 'password1';

export const userOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.firstName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
} as IUser;

export const userTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.firstName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
} as IUser;

export const admin = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.firstName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: false,
} as IUser;

export const insertUsers = async (users: IUser[]) => {
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await hashPassword(user.password),
    }))
  );

  await User.insertMany(usersWithHashedPasswords);
};
