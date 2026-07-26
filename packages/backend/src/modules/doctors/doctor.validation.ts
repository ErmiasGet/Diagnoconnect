import { z } from 'zod';

export const updateDoctorSchema = z.object({
  body: z.object({
    licenseNumber: z.string().optional(),
    specialty: z.string().optional(),
    subSpecialty: z.string().optional(),
    qualifications: z.any().optional(),
    experience: z.number().optional(),
    consultationFee: z.number().optional(),
    followUpFee: z.number().optional(),
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),
    isAcceptingPatients: z.boolean().optional(),
    isTelemedicineEnabled: z.boolean().optional(),
    maxPatientsPerDay: z.number().optional(),
    slotDuration: z.number().optional(),
    availableDays: z.array(z.string()).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
});

export const updateDoctorScheduleSchema = z.object({
  body: z.object({
    schedules: z.array(z.object({
      dayOfWeek: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
      startTime: z.string(),
      endTime: z.string(),
      slotDuration: z.number().default(30),
      maxPatients: z.number().default(20),
      isActive: z.boolean().default(true),
    })),
  }),
});
