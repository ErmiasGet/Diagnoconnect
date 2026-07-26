import { z } from 'zod';

export const createChatRoomSchema = z.object({
  body: z.object({
    type: z.enum(['DIRECT', 'GROUP', 'PATIENT_DOCTOR']).default('DIRECT'),
    name: z.string().optional(),
    memberIds: z.array(z.string().uuid()).min(1),
    patientId: z.string().uuid().optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000),
    type: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO', 'SYSTEM']).default('TEXT'),
    fileUrl: z.string().url().optional(),
  }),
});

export const messageQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    before: z.string().optional(),
  }),
});
