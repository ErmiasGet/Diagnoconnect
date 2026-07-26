import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    visitId: z.string().uuid().optional(),
    recordType: z.enum(['VITALS', 'HISTORY', 'EXAMINATION', 'DIAGNOSIS', 'TREATMENT', 'PROCEDURE', 'PROGRESS_NOTE', 'DISCHARGE_SUMMARY', 'REFERRAL', 'CERTIFICATE', 'LAB_ORDER', 'RADIOLOGY_ORDER', 'OTHER']),
    title: z.string().min(1),
    content: z.any(),
    attachments: z.array(z.string()).optional(),
  }),
});

export const createSOAPNoteSchema = z.object({
  body: z.object({
    visitId: z.string().uuid(),
    patientId: z.string().uuid(),
    doctorId: z.string().uuid().optional(),
    subjective: z.string().min(1),
    objective: z.string().optional(),
    assessment: z.string().min(1),
    plan: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const recordVitalsSchema = z.object({
  body: z.object({
    visitId: z.string().uuid().optional(),
    patientId: z.string().uuid(),
    temperature: z.number().optional(),
    temperatureUnit: z.string().default('C'),
    bloodPressureSystolic: z.number().optional(),
    bloodPressureDiastolic: z.number().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    bloodGlucose: z.number().optional(),
    painScale: z.number().min(0).max(10).optional(),
    notes: z.string().optional(),
  }),
});

export const clinicalDecisionSupportSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    visitId: z.string().uuid().optional(),
    doctorId: z.string().uuid(),
    type: z.string().min(1),
    input: z.any(),
    suggestion: z.any(),
    confidence: z.number().optional(),
  }),
});
