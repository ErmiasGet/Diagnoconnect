import { z } from 'zod';

export const createVisitSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    appointmentId: z.string().uuid().optional(),
    type: z.enum(['OPD', 'IPD', 'EMERGENCY', 'TELEMEDICINE', 'FOLLOW_UP', 'LAB_ONLY', 'RADIOLOGY_ONLY']).default('OPD'),
    departmentId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    chiefComplaint: z.string().optional(),
    symptoms: z.string().optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY']).default('NORMAL'),
    isInsurance: z.boolean().default(false),
    insuranceProvider: z.string().optional(),
    insurancePolicyNo: z.string().optional(),
  }),
});

export const updateVisitSchema = z.object({
  body: z.object({
    status: z.enum([
      'REGISTERED', 'IN_QUEUE', 'IN_PROGRESS', 'LAB_PENDING', 'LAB_COMPLETED',
      'RADIOLOGY_PENDING', 'RADIOLOGY_COMPLETED', 'PHARMACY_PENDING',
      'BILLING_PENDING', 'COMPLETED', 'CANCELLED'
    ]).optional(),
    doctorId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    diagnosis: z.string().optional(),
    diagnosisCode: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    appointmentDate: z.string().or(z.date()),
    startTime: z.string(),
    endTime: z.string(),
    duration: z.number().default(30),
    type: z.enum(['WALK_IN', 'ONLINE', 'FOLLOW_UP', 'EMERGENCY', 'TELEMEDICINE', 'LAB_REVIEW']).default('WALK_IN'),
    reason: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createQueueSchema = z.object({
  body: z.object({
    visitId: z.string().uuid(),
    queueType: z.enum(['RECEPTION', 'DOCTOR', 'LABORATORY', 'RADIOLOGY', 'PHARMACY', 'CASHIER', 'EMERGENCY']),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY']).default('NORMAL'),
    doctorId: z.string().uuid().optional(),
    roomId: z.string().uuid().optional(),
  }),
});
