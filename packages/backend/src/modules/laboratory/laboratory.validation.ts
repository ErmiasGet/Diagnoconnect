import { z } from 'zod';

export const createLaboratorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['GENERAL', 'HEMATOLOGY', 'BIOCHEMISTRY', 'MICROBIOLOGY', 'IMMUNOLOGY', 'PATHOLOGY', 'GENETICS', 'URINALYSIS', 'HISTOPATHOLOGY', 'CYTOLOGY']),
    description: z.string().optional(),
  }),
});

export const updateLaboratorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['GENERAL', 'HEMATOLOGY', 'BIOCHEMISTRY', 'MICROBIOLOGY', 'IMMUNOLOGY', 'PATHOLOGY', 'GENETICS', 'URINALYSIS', 'HISTOPATHOLOGY', 'CYTOLOGY']).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createTestSchema = z.object({
  body: z.object({
    laboratoryId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(20),
    description: z.string().optional(),
    sampleType: z.string().optional(),
    sampleVolume: z.string().optional(),
    containerType: z.string().optional(),
    turnaroundTime: z.number().optional(),
    turnaroundUnit: z.string().default('hours'),
    price: z.number().min(0),
    normalRange: z.any().optional(),
    instructions: z.string().optional(),
  }),
});

export const updateTestSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(20).optional(),
    description: z.string().optional(),
    sampleType: z.string().optional(),
    price: z.number().min(0).optional(),
    normalRange: z.any().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createTestCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(20),
    description: z.string().optional(),
  }),
});

export const createLabRequestSchema = z.object({
  body: z.object({
    visitId: z.string().uuid(),
    testId: z.string().uuid(),
    clinicalInfo: z.string().optional(),
    urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY']).default('NORMAL'),
    scheduledDate: z.string().or(z.date()).optional(),
  }),
});

export const enterResultsSchema = z.object({
  body: z.object({
    labResultId: z.string().uuid(),
    overallNotes: z.string().optional(),
    results: z.array(z.object({
      testId: z.string().uuid(),
      parameter: z.string(),
      value: z.string(),
      unit: z.string().optional(),
      referenceRange: z.string().optional(),
      isAbnormal: z.boolean().default(false),
      flag: z.string().optional(),
      notes: z.string().optional(),
    })).min(1),
  }),
});
