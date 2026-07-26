import { z } from 'zod';

export const createInsuranceProviderSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(20),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.any().optional(),
    claimSubmissionMethod: z.string().optional(),
    reimbursementRate: z.number().optional(),
  }),
});

export const updateInsuranceProviderSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.any().optional(),
    claimSubmissionMethod: z.string().optional(),
    reimbursementRate: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createInsurancePolicySchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    providerId: z.string().uuid(),
    policyNumber: z.string().min(1),
    policyType: z.string().optional(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    coverageAmount: z.number().min(0),
    copayPercent: z.number().optional(),
    deductible: z.number().optional(),
  }),
});

export const createClaimSchema = z.object({
  body: z.object({
    policyId: z.string().uuid(),
    providerId: z.string().uuid(),
    patientId: z.string().uuid(),
    visitId: z.string().uuid().optional(),
    treatmentDate: z.string().or(z.date()).optional(),
    diagnosisCode: z.string().optional(),
    diagnosis: z.string().optional(),
    treatmentDescription: z.string().optional(),
    totalAmount: z.number().min(0),
  }),
});

export const reviewClaimSchema = z.object({
  body: z.object({
    status: z.enum(['UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED']),
    approvedAmount: z.number().optional(),
    reviewNotes: z.string().optional(),
  }),
});
