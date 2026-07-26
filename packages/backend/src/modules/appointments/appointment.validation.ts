import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    appointmentDate: z.string().or(z.date()),
    startTime: z.string(),
    endTime: z.string(),
    duration: z.number().min(5).max(480).default(30),
    type: z.enum(['WALK_IN', 'ONLINE', 'FOLLOW_UP', 'EMERGENCY', 'TELEMEDICINE', 'LAB_REVIEW']).default('WALK_IN'),
    reason: z.string().optional(),
    notes: z.string().optional(),
    consultationFee: z.number().optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    appointmentDate: z.string().or(z.date()).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    duration: z.number().min(5).max(480).optional(),
    type: z.enum(['WALK_IN', 'ONLINE', 'FOLLOW_UP', 'EMERGENCY', 'TELEMEDICINE', 'LAB_REVIEW']).optional(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
    cancellationReason: z.string().optional(),
  }),
});

export const cancelAppointmentSchema = z.object({
  body: z.object({
    cancellationReason: z.string().min(1),
  }),
});

export const rescheduleAppointmentSchema = z.object({
  body: z.object({
    appointmentDate: z.string().or(z.date()),
    startTime: z.string(),
    endTime: z.string(),
  }),
});

export const appointmentQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
    type: z.enum(['WALK_IN', 'ONLINE', 'FOLLOW_UP', 'EMERGENCY', 'TELEMEDICINE', 'LAB_REVIEW']).optional(),
    doctorId: z.string().uuid().optional(),
    patientId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    today: z.string().optional(),
  }),
});
