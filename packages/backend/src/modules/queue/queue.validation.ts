import { z } from 'zod';

export const createQueueEntrySchema = z.object({
  body: z.object({
    visitId: z.string().uuid(),
    queueType: z.enum(['RECEPTION', 'DOCTOR', 'LABORATORY', 'RADIOLOGY', 'PHARMACY', 'CASHIER', 'EMERGENCY']),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY']).default('NORMAL'),
    doctorId: z.string().uuid().optional(),
    roomId: z.string().uuid().optional(),
  }),
});

export const updateQueueSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid().optional(),
    roomId: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY']).optional(),
  }),
});

export const callNextSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid().optional(),
    roomId: z.string().uuid().optional(),
  }),
});

export const queueQuerySchema = z.object({
  query: z.object({
    queueType: z.enum(['RECEPTION', 'DOCTOR', 'LABORATORY', 'RADIOLOGY', 'PHARMACY', 'CASHIER', 'EMERGENCY']).optional(),
    status: z.enum(['WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED']).optional(),
  }),
});
