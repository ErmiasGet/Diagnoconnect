import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new ApiError(message, 409, 'CONFLICT');
  }

  static validation(message: string, details?: unknown) {
    return new ApiError(message, 422, 'VALIDATION_ERROR', details);
  }

  static tooMany(message: string = 'Too many requests') {
    return new ApiError(message, 429, 'TOO_MANY_REQUESTS');
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
}

export class ApiResponse {
  static success(res: Response, data: unknown, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, data: unknown, message: string = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res: Response, data: unknown[], total: number, page: number, limit: number) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(ApiError.validation('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function getPagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  return { page, limit, skip, sortBy, sortOrder };
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    phone?: string;
    role: string;
    organizationId?: string;
    firstName: string;
    lastName: string;
  };
}
