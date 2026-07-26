import { z } from 'zod';

export const processPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().uuid(),
    amount: z.number().min(0.01),
    method: z.enum(['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'ARIFPAY', 'CHAPA', 'STRIPE', 'PAYPAL', 'WALLET', 'INSURANCE']),
    reference: z.string().optional(),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const paymentQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    method: z.string().optional(),
    status: z.string().optional(),
    invoiceId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1),
    gateway: z.enum(['STRIPE', 'CHAPA', 'ARIFPAY']),
  }),
});
