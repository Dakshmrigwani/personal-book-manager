import { apiFetch } from '../api';
import type {
  AuthResponse,
  AuthTokens,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from './types';

/**
 * Register a new user
 * Route: POST /auth/register
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      role: 'user',
      ...payload,
    }),
  });
}

/**
 * Log in an existing user
 * Route: POST /auth/login
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Log out user by invalidating refresh token
 * Route: POST /auth/logout
 */
export async function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * Refresh access and refresh tokens
 * Route: POST /auth/refresh-tokens
 */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>('/auth/refresh-tokens', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * Request password reset email
 * Route: POST /auth/forgot-password
 */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  return apiFetch<void>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Reset password using token received via email
 * Route: POST /auth/reset-password?token=...
 */
export async function resetPassword(token: string, payload: ResetPasswordPayload): Promise<void> {
  const query = new URLSearchParams({ token }).toString();
  return apiFetch<void>(`/auth/reset-password?${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Send email verification link to current authenticated user
 * Route: POST /auth/send-verification-email
 */
export async function sendVerificationEmail(): Promise<void> {
  return apiFetch<void>('/auth/send-verification-email', {
    method: 'POST',
  });
}

/**
 * Verify user email using token from email link
 * Route: POST /auth/verify-email?token=...
 */
export async function verifyEmail(token: string): Promise<void> {
  const query = new URLSearchParams({ token }).toString();
  return apiFetch<void>(`/auth/verify-email?${query}`, {
    method: 'POST',
  });
}
