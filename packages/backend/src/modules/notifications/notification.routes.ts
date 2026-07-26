import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createNotificationSchema } from './notification.validation';

const router = Router();

router.use(authenticate);

router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/', NotificationController.getUserNotifications);
router.post('/', authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'CASHIER'), validate(createNotificationSchema), NotificationController.create);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
