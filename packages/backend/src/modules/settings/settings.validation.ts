import { z } from 'zod';

export const updateOrgSettingsSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    address: z.any().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    currency: z.string().optional(),
    taxRate: z.number().optional(),
    settings: z.any().optional(),
    branding: z.any().optional(),
  }),
});

export const upsertSettingSchema = z.object({
  body: z.object({
    key: z.string().min(1).max(100),
    value: z.any(),
    category: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const bulkUpdateSettingsSchema = z.object({
  body: z.object({
    settings: z.array(z.object({
      key: z.string().min(1),
      value: z.any(),
      category: z.string().optional(),
      description: z.string().optional(),
    })).min(1),
  }),
});
