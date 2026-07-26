import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../utils/helpers';
import { authenticate } from '../../middleware/auth';
import { authRateLimit } from '../../middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  sendOTPSchema,
  verifyOTPSchema,
} from './auth.validation';

const router = Router();

router.post('/register', authRateLimit, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimit, validate(loginSchema), AuthController.login);
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authRateLimit, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/send-otp', authRateLimit, validate(sendOTPSchema), AuthController.sendOTP);
router.post('/verify-otp', authRateLimit, validate(verifyOTPSchema), AuthController.verifyOTP);
router.post('/revoke-sessions', authenticate, AuthController.revokeAllSessions);

export default router;
