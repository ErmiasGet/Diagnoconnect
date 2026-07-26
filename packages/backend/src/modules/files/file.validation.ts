import { z } from 'zod';

export const uploadFileSchema = z.object({
  body: z.object({
    patientId: z.string().uuid().optional(),
    fileName: z.string().min(1),
    originalName: z.string().min(1),
    mimeType: z.string().min(1),
    size: z.number().min(1),
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    category: z.enum(['MEDICAL_REPORT', 'LAB_REPORT', 'RADIOLOGY_IMAGE', 'PRESCRIPTION', 'IDENTIFICATION', 'INSURANCE', 'PHOTO', 'DOCUMENT', 'OTHER']).default('DOCUMENT'),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().default(false),
  }),
});

export const fileQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    patientId: z.string().uuid().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  }),
});
