import { z } from 'zod';

export const reportQuerySchema = z.object({
  query: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    reportType: z.string().optional(),
  }),
});

export const generateReportSchema = z.object({
  body: z.object({
    reportType: z.string().min(1),
    title: z.string().min(1),
    parameters: z.any().optional(),
  }),
});
