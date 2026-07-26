import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    visitId: z.string().uuid().optional(),
    dueDate: z.string().or(z.date()).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().optional(),
    notes: z.string().optional(),
    isInsurance: z.boolean().default(false),
    insuranceAmount: z.number().optional(),
    items: z.array(z.object({
      description: z.string().min(1),
      category: z.enum(['CONSULTATION', 'LABORATORY', 'RADIOLOGY', 'PHARMACY', 'PROCEDURE', 'ROOM', 'NURSING', 'MISCELLANEOUS']),
      testId: z.string().uuid().optional(),
      medicineId: z.string().uuid().optional(),
      quantity: z.number().min(1).default(1),
      unitPrice: z.number().min(0),
      taxRate: z.number().optional(),
    })).min(1),
  }),
});

export const processPaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(0.01),
    method: z.enum(['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'ARIFPAY', 'CHAPA', 'STRIPE', 'PAYPAL', 'WALLET', 'INSURANCE']),
    reference: z.string().optional(),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createRefundSchema = z.object({
  body: z.object({
    amount: z.number().min(0.01),
    reason: z.string().min(1),
  }),
});

export const invoiceQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    status: z.enum(['DRAFT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
    patientId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});
