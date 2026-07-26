import prisma from '../../config/database';
import { TokenService, TokenPayload } from '../../utils/tokens';
import { ApiError } from '../../utils/helpers';
import { EmailService } from '../../utils/email';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    organizationId?: string;
  }, req?: Request) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
        ...(data.organizationId ? { organizationId: data.organizationId } : {}),
      },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email or phone already exists');
    }

    const hashedPassword = await TokenService.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role as any) || 'PATIENT',
        organizationId: data.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
      },
    });

    // Create patient profile if role is PATIENT
    if (user.role === 'PATIENT' && user.organizationId) {
      const mrn = TokenService.generateMedicalRecordNumber();
      await prisma.patient.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          medicalRecordNumber: mrn,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: new Date('1990-01-01'),
          gender: 'MALE',
          phone: user.phone,
          email: user.email,
        },
      });
    }

    // Generate verification token
    const verificationToken = uuidv4();
    await CacheService.set(`email_verify:${verificationToken}`, user.id, 86400);

    // Send verification email
    if (user.email) {
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    }

    // Generate tokens
    const tokens = TokenService.generateTokens({
      id: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role,
      organizationId: user.organizationId || undefined,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await AuditService.logCreate(user.organizationId, user.id, 'User', user.id, user as any, req);

    return { user, ...tokens };
  }

  static async login(data: { email: string; password: string; organizationSlug?: string }, req?: Request) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.email },
        ],
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, isActive: true, logo: true },
        },
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Account is deactivated. Please contact support.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw ApiError.unauthorized('Account is temporarily locked. Please try again later.');
    }

    const isPasswordValid = await TokenService.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      const loginAttempts = user.loginAttempts + 1;
      const lockedUntil = loginAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts, lockedUntil },
      });

      throw ApiError.unauthorized('Invalid credentials');
    }

    // Reset login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    // If organizationSlug provided, verify access
    if (data.organizationSlug && user.organization) {
      if (user.organization.slug !== data.organizationSlug) {
        throw ApiError.forbidden('You do not have access to this organization');
      }
    }

    const tokens = TokenService.generateTokens({
      id: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role,
      organizationId: user.organizationId || undefined,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await AuditService.logLogin(user.id, user.organizationId, req);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        organization: user.organization,
      },
      ...tokens,
    };
  }

  static async refreshToken(token: string) {
    const tokenData = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!tokenData || tokenData.isRevoked || tokenData.expiresAt < new Date()) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = tokenData.user;
    const tokens = TokenService.generateTokens({
      id: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role,
      organizationId: user.organizationId || undefined,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: tokenData.id },
      data: { isRevoked: true },
    });

    // Store new token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken },
        data: { isRevoked: true },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }] },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const resetToken = uuidv4();
    await CacheService.set(`password_reset:${resetToken}`, user.id, 3600);

    if (user.email) {
      await EmailService.sendPasswordReset(user.email, resetToken);
    }

    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  static async resetPassword(token: string, newPassword: string) {
    const userId = await CacheService.get<string>(`password_reset:${token}`);
    if (!userId) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await TokenService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await CacheService.del(`password_reset:${token}`);
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password reset successfully' };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const isValid = await TokenService.comparePassword(currentPassword, user.password);
    if (!isValid) throw ApiError.badRequest('Current password is incorrect');

    const hashedPassword = await TokenService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password changed successfully' };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        mfaEnabled: true,
        preferredLanguage: true,
        organizationId: true,
        createdAt: true,
        lastLoginAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            type: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            specialty: true,
            consultationFee: true,
            rating: true,
          },
        },
        patientProfile: {
          select: {
            id: true,
            medicalRecordNumber: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
    });

    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  static async sendOTP(phone: string, purpose: string) {
    const code = TokenService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt,
      },
    });

    // In production, send via SMS service
    console.log(`OTP for ${phone}: ${code}`);

    return { message: 'OTP sent successfully', code: process.env.NODE_ENV === 'development' ? code : undefined };
  }

  static async verifyOTP(phone: string, code: string, purpose: string) {
    const otp = await prisma.oTP.findFirst({
      where: {
        phone,
        code,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw ApiError.badRequest('Invalid or expired OTP');
    }

    await prisma.oTP.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    if (purpose === 'VERIFICATION') {
      await prisma.user.updateMany({
        where: { phone },
        data: { isPhoneVerified: true },
      });
    }

    return { verified: true };
  }

  static async revokeAllTokens(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
    return { message: 'All sessions revoked' };
  }
}
