import { env } from '@/config';
import { tokenTypes } from '@/config/tokens';
import Token from '@/models/token.model';
import type { IToken, IUser, TokenTypes } from '@/types';
import { ApiError } from '@/utils';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import type { Types } from 'mongoose';
import userService from './user.service';

const generateToken = (
  userId: string | Types.ObjectId,
  expires: moment.Moment,
  type: TokenTypes,
  secret = env.jwt.secret,
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const saveToken = async (
  token: string,
  userId: string | Types.ObjectId,
  expires: moment.Moment,
  type: TokenTypes,
  blacklisted = false,
) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

const verifyToken = async (token: string, type: TokenTypes) => {
  const payload = jwt.verify(token, env.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const generateAuthTokens = async (user: IUser) => {
  const accessTokenExpires = moment().add(env.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(env.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const generateResetPasswordToken = async (email: string) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(env.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

const generateVerifyEmailToken = async (user: IUser) => {
  const expires = moment().add(env.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

const getToken = async (where: Partial<IToken>) => {
  const tokenDoc = await Token.findOne(where);

  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }

  return tokenDoc;
};

const deleteToken = async (where: Partial<IToken>) => {
  const tokenDoc = await Token.findOneAndDelete(where);

  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }
};

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  getToken,
  deleteToken,
};
