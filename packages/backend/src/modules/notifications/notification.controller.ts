import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class NotificationController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const notification = await NotificationService.create(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, notification, 'Notification created');
  });

  static getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
    const { notifications, total, unreadCount, page, limit } = await NotificationService.getUserNotifications(req.user!.id, req.query as any);
    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total, page, limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await NotificationService.markAsRead(req.user!.id, req.params.id);
    ApiResponse.success(res, notification, 'Marked as read');
  });

  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.markAllAsRead(req.user!.id);
    ApiResponse.success(res, { success: true }, 'All notifications marked as read');
  });

  static deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.deleteNotification(req.user!.id, req.params.id);
    ApiResponse.noContent(res);
  });

  static getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const result = await NotificationService.getUnreadCount(req.user!.id);
    ApiResponse.success(res, result);
  });
}
