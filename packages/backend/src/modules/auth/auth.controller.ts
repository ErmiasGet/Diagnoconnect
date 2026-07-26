import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse, ApiError, asyncHandler } from '../../utils/helpers';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body, req);
    ApiResponse.created(res, result, 'Registration successful');
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body, req);
    ApiResponse.success(res, result, 'Login successful');
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await AuthService.refreshToken(req.body.refreshToken);
    ApiResponse.success(res, tokens, 'Token refreshed');
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    await AuthService.logout(req.user!.id, req.body.refreshToken);
    ApiResponse.success(res, null, 'Logged out successfully');
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body.email);
    ApiResponse.success(res, result);
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body.token, req.body.password);
    ApiResponse.success(res, result);
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    ApiResponse.success(res, result);
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await AuthService.getProfile(req.user!.id);
    ApiResponse.success(res, profile);
  });

  static sendOTP = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.sendOTP(req.body.phone, req.body.purpose);
    ApiResponse.success(res, result);
  });

  static verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.verifyOTP(req.body.phone, req.body.code, req.body.purpose);
    ApiResponse.success(res, result);
  });

  static revokeAllSessions = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.revokeAllTokens(req.user!.id);
    ApiResponse.success(res, result);
  });
}
