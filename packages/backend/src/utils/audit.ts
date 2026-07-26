import prisma from '../config/database';
import { Request } from 'express';

interface AuditLogParams {
  organizationId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  req?: Request;
}

export class AuditService {
  static async log(params: AuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          oldValues: params.oldValues || undefined,
          newValues: params.newValues || undefined,
          ipAddress: params.req?.ip || params.req?.socket?.remoteAddress,
          userAgent: params.req?.headers['user-agent'],
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async logCreate(
    organizationId: string | undefined,
    userId: string | undefined,
    entity: string,
    entityId: string,
    newValues: Record<string, unknown>,
    req?: Request
  ) {
    return this.log({ organizationId, userId, action: 'CREATE', entity, entityId, newValues, req });
  }

  static async logUpdate(
    organizationId: string | undefined,
    userId: string | undefined,
    entity: string,
    entityId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
    req?: Request
  ) {
    return this.log({ organizationId, userId, action: 'UPDATE', entity, entityId, oldValues, newValues, req });
  }

  static async logDelete(
    organizationId: string | undefined,
    userId: string | undefined,
    entity: string,
    entityId: string,
    req?: Request
  ) {
    return this.log({ organizationId, userId, action: 'DELETE', entity, entityId, req });
  }

  static async logLogin(userId: string, organizationId?: string, req?: Request) {
    return this.log({ organizationId, userId, action: 'LOGIN', entity: 'User', entityId: userId, req });
  }
}
