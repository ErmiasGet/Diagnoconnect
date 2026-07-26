import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    type: z.enum(['APPOINTMENT', 'QUEUE', 'LAB_RESULT', 'PRESCRIPTION', 'PAYMENT', 'MESSAGE', 'SYSTEM', 'EMERGENCY']).default('SYSTEM'),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    data: z.any().optional(),
    channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP']).default('IN_APP'),
  }),
});

export const notificationQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.string().optional(),
    isRead: z.string().optional(),
  }),
});
