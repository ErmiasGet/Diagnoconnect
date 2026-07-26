import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  body: z.object({
    visitId: z.string().uuid().optional(),
    patientId: z.string().uuid(),
    validUntil: z.string().or(z.date()).optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      medicineId: z.string().uuid().optional(),
      medicineName: z.string().min(1),
      dosage: z.string().min(1),
      frequency: z.string().min(1),
      duration: z.string().min(1),
      quantity: z.number().min(1),
      instructions: z.string().optional(),
      notes: z.string().optional(),
    })).min(1),
  }),
});

export const dispensePrescriptionSchema = z.object({
  body: z.object({
    dispensedItems: z.array(z.object({
      prescriptionItemId: z.string().uuid(),
      isDispensed: z.boolean(),
    })).optional(),
  }),
});
