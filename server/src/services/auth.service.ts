import { logger } from '@/config/logger';
import { tokenTypes } from '@/config/tokens';
import { ApiError } from '@/utils';
import { comparePassword } from '@/utils/password-hash';
import httpStatus from 'http-status';
import tokenService from './token.service';
import userService from './user.service';

const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

const logout = async (refreshToken: string) => {
  await tokenService.deleteToken({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
};

const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);

    await tokenService.deleteToken({ user: refreshTokenDoc.user });
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

const resetPassword = async (resetPasswordToken: string, newPassword: string) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    await userService.updateUserById(user.id, { password: newPassword });
    await tokenService.deleteToken({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

const verifyEmail = async (verifyEmailToken: string) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);

    await tokenService.deleteToken({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
