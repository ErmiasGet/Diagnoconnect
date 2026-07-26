import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class NotificationService {
  static async create(organizationId: string, data: any, userId?: string, req?: Request) {
    const notification = await prisma.notification.create({
      data: {
        organizationId,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        data: data.data,
        channel: data.channel,
      },
    });

    if (userId) {
      await AuditService.logCreate(organizationId, userId, 'Notification', notification.id, notification as any, req);
    }
    return notification;
  }

  static async getUserNotifications(userId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.type && { type: query.type as any }),
      ...(query.isRead !== undefined && { isRead: query.isRead === 'true' }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!notification) throw ApiError.notFound('Notification not found');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  static async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!notification) throw ApiError.notFound('Notification not found');

    await prisma.notification.delete({ where: { id: notificationId } });
    return { success: true };
  }

  static async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    return { unreadCount: count };
  }
}
