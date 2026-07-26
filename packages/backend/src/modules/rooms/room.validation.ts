import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    number: z.string().min(1).max(20),
    type: z.enum(['CONSULTATION', 'EXAMINATION', 'LABORATORY', 'RADIOLOGY', 'PHARMACY', 'SURGERY', 'EMERGENCY', 'RECEPTION', 'WAITING', 'WARD', 'ICU', 'OPD']),
    departmentId: z.string().uuid().optional(),
    floor: z.number().optional(),
    capacity: z.number().min(1).default(1),
  }),
});

export const updateRoomSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    number: z.string().min(1).max(20).optional(),
    type: z.enum(['CONSULTATION', 'EXAMINATION', 'LABORATORY', 'RADIOLOGY', 'PHARMACY', 'SURGERY', 'EMERGENCY', 'RECEPTION', 'WAITING', 'WARD', 'ICU', 'OPD']).optional(),
    departmentId: z.string().uuid().optional().nullable(),
    floor: z.number().optional(),
    capacity: z.number().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});
