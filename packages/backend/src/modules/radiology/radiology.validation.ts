import { z } from 'zod';

export const createRadiologyRequestSchema = z.object({
  body: z.object({
    visitId: z.string().uuid(),
    patientId: z.string().uuid(),
    modality: z.enum(['XRAY', 'CT', 'MRI', 'ULTRASOUND', 'MAMMOGRAM', 'DEXA', 'PET', 'FLUOROSCOPY', 'NUCLEAR_MEDICINE', 'INTERVENTIONAL']),
    bodyPart: z.string().min(1),
    clinicalInfo: z.string().optional(),
    urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY']).default('NORMAL'),
    scheduledDate: z.string().or(z.date()).optional(),
  }),
});

export const createRadiologyReportSchema = z.object({
  body: z.object({
    requestId: z.string().uuid(),
    patientId: z.string().uuid(),
    findings: z.string().min(1),
    impression: z.string().min(1),
    recommendation: z.string().optional(),
  }),
});

export const uploadImageSchema = z.object({
  body: z.object({
    requestId: z.string().uuid(),
    imageUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    dicomUrl: z.string().url().optional(),
    modality: z.string().optional(),
    bodyPart: z.string().optional(),
    description: z.string().optional(),
  }),
});
