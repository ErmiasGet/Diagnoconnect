import { Request, Response, NextFunction } from 'express';
import { TokenService, TokenPayload } from '../utils/tokens';
import { ApiError } from '../utils/helpers';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      organizationId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const payload = TokenService.verifyAccessToken(token);
    req.user = payload;
    req.organizationId = payload.organizationId;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired token'));
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

export function requireOrganization(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.organizationId) {
    return next(ApiError.badRequest('Organization context required'));
  }
  next();
}

export function authorizeOrganization(...roles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const hasRole = roles.includes(req.user.role);
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    if (!hasRole && !isSuperAdmin) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}

export async function extractOrganizationFromHeader(req: Request, _res: Response, next: NextFunction) {
  const orgSlug = req.headers['x-organization-slug'] as string;

  if (orgSlug) {
    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true, isActive: true },
    });

    if (org && org.isActive) {
      req.organizationId = org.id;
    }
  }

  next();
}
