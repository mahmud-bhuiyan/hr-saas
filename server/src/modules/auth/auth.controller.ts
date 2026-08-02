import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { signAccessToken, verifyRefreshToken } from '../../utils/jwt.js';
import {
  AuthServiceError,
  getUserById,
  loginUser,
  registerCompany,
} from './auth.service.js';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation.js';
import { getProfile, updateProfile, uploadProfileAvatar } from './profile.service.js';
import { updateProfileSchema, uploadAvatarSchema } from './profile.validation.js';
import {
  requestPasswordReset,
  resetPasswordWithToken,
} from './password-reset.service.js';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/api/v1/auth',
  });
}

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
}

const validationError = (res: Response, message: string): void => {
  res.status(400).json({ status: 'error', message });
}

export const createRegisterHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        validationError(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
        return;
      }

      const result = await registerCompany(parsed.data);

      res.status(201).json({
        status: 'ok',
        data: result,
      });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
}

export const createLoginHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        validationError(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
        return;
      }

      const result = await loginUser(parsed.data, env);
      setRefreshCookie(res, result.tokens.refreshToken);

      res.json({
        status: 'ok',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
}

export const createRefreshHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      if (!token) {
        res.status(401).json({ status: 'error', message: 'Refresh token required' });
        return;
      }

      const payload = verifyRefreshToken(token, env.adminJwtSecret);
      const user = await getUserById(payload.sub);

      if (!user) {
        clearRefreshCookie(res);
        res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
        return;
      }

      res.json({
        status: 'ok',
        data: {
          user,
          accessToken: signAccessToken(
            {
              sub: user.id,
              email: user.email,
              role: user.role,
              tenantId: user.tenantId,
            },
            env.adminJwtSecret
          ),
        },
      });
    } catch {
      clearRefreshCookie(res);
      res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
    }
  };
}

export const createLogoutHandler = () => {
  return (_req: AuthenticatedRequest, res: Response): void => {
    clearRefreshCookie(res);
    res.json({ status: 'ok', data: { message: 'Logged out' } });
  };
}

export const meHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const profile = await getProfile(req.user.sub);
    if (!profile) {
      res.status(401).json({ status: 'error', message: 'User not found or inactive' });
      return;
    }

    res.json({ status: 'ok', data: { user: profile } });
  } catch {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const createUpdateMeHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Authentication required' });
        return;
      }

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        validationError(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
        return;
      }

      const result = await updateProfile(req.user.sub, parsed.data, env);

      res.json({
        status: 'ok',
        data: result,
      });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const createUploadAvatarHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Authentication required' });
        return;
      }

      const parsed = uploadAvatarSchema.safeParse(req.body);
      if (!parsed.success) {
        validationError(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
        return;
      }

      const result = await uploadProfileAvatar(req.user.sub, parsed.data, env);

      res.json({
        status: 'ok',
        data: result,
      });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const createForgotPasswordHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        validationError(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
        return;
      }

      const result = await requestPasswordReset(parsed.data.email, env);
      res.json({ status: 'ok', data: result });
    } catch {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const createResetPasswordHandler = () => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        validationError(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
        return;
      }

      const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
      res.json({ status: 'ok', data: result });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};
