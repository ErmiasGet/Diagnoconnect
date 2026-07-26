import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface TokenPayload {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  organizationId?: string;
  firstName: string;
  lastName: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export class TokenService {
  static generateTokens(payload: TokenPayload): JwtTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    });

    const refreshToken = jwt.sign({ id: payload.id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as string,
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): { id: string } {
    return jwt.verify(token, config.jwt.refreshSecret) as { id: string };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateMedicalRecordNumber(prefix: string = 'MRN'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
