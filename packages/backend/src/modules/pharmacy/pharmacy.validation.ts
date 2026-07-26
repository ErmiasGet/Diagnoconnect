import { z } from 'zod';

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    genericName: z.string().optional(),
    brandName: z.string().optional(),
    category: z.string().optional(),
    dosageForm: z.string().optional(),
    strength: z.string().optional(),
    unit: z.string().optional(),
    manufacturer: z.string().optional(),
    supplierId: z.string().uuid().optional(),
    barcode: z.string().optional(),
    sku: z.string().optional(),
    costPrice: z.number().min(0),
    sellingPrice: z.number().min(0),
    marginPercent: z.number().optional(),
    taxRate: z.number().optional(),
    currentStock: z.number().min(0).default(0),
    minimumStock: z.number().min(0).default(10),
    maximumStock: z.number().min(0).default(1000),
    reorderLevel: z.number().min(0).default(20),
    storageLocation: z.string().optional(),
    requiresPrescription: z.boolean().default(false),
    sideEffects: z.string().optional(),
    contraindications: z.string().optional(),
    interactions: z.string().optional(),
    expiryDate: z.string().or(z.date()).optional(),
  }),
});

export const updateMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    genericName: z.string().optional(),
    brandName: z.string().optional(),
    category: z.string().optional(),
    dosageForm: z.string().optional(),
    strength: z.string().optional(),
    costPrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    minimumStock: z.number().optional(),
    maximumStock: z.number().optional(),
    reorderLevel: z.number().optional(),
    storageLocation: z.string().optional(),
    requiresPrescription: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const stockAdjustmentSchema = z.object({
  body: z.object({
    medicineId: z.string().uuid(),
    type: z.enum(['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'TRANSFER', 'EXPIRED', 'DAMAGED']),
    quantity: z.number().min(1),
    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.any().optional(),
    gstNumber: z.string().optional(),
    paymentTerms: z.string().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.any().optional(),
    gstNumber: z.string().optional(),
    paymentTerms: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid(),
    expectedDate: z.string().or(z.date()).optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      medicineId: z.string().uuid(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })).min(1),
  }),
});
