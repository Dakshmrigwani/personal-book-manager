import type { rolesAllowed } from '@/config';
import type { tokenTypes } from '@/config/tokens';
import type { Request } from 'express';
import type { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import type { Model, Types } from 'mongoose';

type UserRole = (typeof rolesAllowed)[number];

export interface IUser {
  _id: Types.ObjectId;
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface IToken {
  token: string;
  user: string; //userId
  type: TokenTypes;
  expires: Date;
  blacklisted: boolean;
}

export type TokenTypes = (typeof tokenTypes)[keyof typeof tokenTypes];

export interface PaginatedModel<T> extends Model<T> {
  paginate(options: PaginationOptions, filters: PaginationFilters<T>): Promise<PaginateResult<T>>;
}

export type PaginationFilters<T> = Partial<{
  [K in keyof T]: string | number;
}>;

export interface PaginationOptions {
  limit?: string;
  page?: string;
  sortBy?: string;
  populate?: string;
}

export interface PaginateResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface AuthedReq extends Request {
  user: IUser;
}

export interface AppJwtPayload extends BaseJwtPayload {
  sub: string;
  type: string;
}

export interface CreateUserPaylaod {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ITag {
  _id: Types.ObjectId;
  id: string;
  name: string;
  color?: string;
  user: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookStatus = 'want-to-read' | 'reading' | 'completed' | 'dnf';

export interface IBook {
  _id: Types.ObjectId;
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  tags: (Types.ObjectId | string | ITag)[];
  rating?: number;
  pages?: number;
  coverImage?: string;
  description?: string;
  user: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookStats {
  total: number;
  wantToRead: number;
  reading: number;
  completed: number;
  dnf: number;
}

