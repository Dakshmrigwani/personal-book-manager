import moment from 'moment';
import { tokenTypes } from '@/config/tokens';
import tokenService from '@/services/token.service';
import { env } from '@/config';
import { admin, userOne } from './user.fixture';

const accessTokenExpires = moment().add(env.jwt.accessExpirationMinutes, 'minutes');

export const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
export const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);
