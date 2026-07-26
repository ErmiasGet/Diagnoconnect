import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class PharmacyService {
  static async createMedicine(organizationId: string, data: any, userId: string, req?: Request) {
    if (data.barcode) {
      const existing = await prisma.medicine.findFirst({ where: { organizationId, barcode: data.barcode } });
      if (existing) throw ApiError.conflict('Medicine with this barcode already exists');
    }

    const medicine = await prisma.medicine.create({
      data: {
        organizationId,
        name: data.name,
        genericName: data.genericName,
        brandName: data.brandName,
        category: data.category,
        dosageForm: data.dosageForm,
        strength: data.strength,
        unit: data.unit,
        manufacturer: data.manufacturer,
        supplierId: data.supplierId,
        barcode: data.barcode,
        sku: data.sku,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        marginPercent: data.marginPercent,
        taxRate: data.taxRate,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
        maximumStock: data.maximumStock,
        reorderLevel: data.reorderLevel,
        storageLocation: data.storageLocation,
        requiresPrescription: data.requiresPrescription,
        sideEffects: data.sideEffects,
        contraindications: data.contraindications,
        interactions: data.interactions,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
      include: { supplier: { select: { id: true, name: true } } },
    });

    await AuditService.logCreate(organizationId, userId, 'Medicine', medicine.id, medicine as any, req);
    return medicine;
  }

  static async getAllMedicines(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.MedicineWhereInput = {
      organizationId,
      ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
      ...(query.category && { category: query.category }),
      ...(query.lowStock && { currentStock: { lte: prisma.medicine.fields.reorderLevel } } as any),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { genericName: { contains: query.search, mode: 'insensitive' } },
          { brandName: { contains: query.search, mode: 'insensitive' } },
          { barcode: { contains: query.search } },
          { sku: { contains: query.search } },
        ],
      }),
    };

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: { supplier: { select: { id: true, name: true } } },
      }),
      prisma.medicine.count({ where }),
    ]);

    return { medicines, total, page, limit };
  }

  static async getMedicineById(organizationId: string, medicineId: string) {
    const medicine = await prisma.medicine.findFirst({
      where: { id: medicineId, organizationId },
      include: {
        supplier: { select: { id: true, name: true, phone: true } },
        stockMovements: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!medicine) throw ApiError.notFound('Medicine not found');
    return medicine;
  }

  static async updateMedicine(organizationId: string, medicineId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.medicine.findFirst({ where: { id: medicineId, organizationId } });
    if (!existing) throw ApiError.notFound('Medicine not found');

    const medicine = await prisma.medicine.update({ where: { id: medicineId }, data, include: { supplier: { select: { id: true, name: true } } } });
    await AuditService.logUpdate(organizationId, userId, 'Medicine', medicineId, existing as any, medicine as any, req);
    return medicine;
  }

  static async adjustStock(organizationId: string, data: any, userId: string, req?: Request) {
    const medicine = await prisma.medicine.findFirst({ where: { id: data.medicineId, organizationId } });
    if (!medicine) throw ApiError.notFound('Medicine not found');

    let newStock = medicine.currentStock;
    if (['PURCHASE', 'RETURN', 'ADJUSTMENT'].includes(data.type)) {
      newStock += data.quantity;
    } else {
      newStock -= data.quantity;
    }

    if (newStock < 0) throw ApiError.badRequest('Insufficient stock');

    const [updatedMedicine] = await prisma.$transaction([
      prisma.medicine.update({ where: { id: data.medicineId }, data: { currentStock: newStock } }),
      prisma.stockMovement.create({
        data: {
          medicineId: data.medicineId,
          type: data.type,
          quantity: data.quantity,
          fromLocation: data.fromLocation,
          toLocation: data.toLocation,
          reference: data.reference,
          notes: data.notes,
        },
      }),
    ]);

    await AuditService.logUpdate(organizationId, userId, 'Medicine', data.medicineId, medicine as any, updatedMedicine as any, req);
    return updatedMedicine;
  }

  static async getLowStockAlerts(organizationId: string) {
    const medicines = await prisma.medicine.findMany({
      where: {
        organizationId,
        isActive: true,
        currentStock: { lte: prisma.medicine.fields.reorderLevel },
      },
      include: { supplier: { select: { id: true, name: true, phone: true } } },
      orderBy: { currentStock: 'asc' },
    });
    return medicines;
  }

  static async createSupplier(organizationId: string, data: any, userId: string, req?: Request) {
    const supplier = await prisma.supplier.create({
      data: { organizationId, name: data.name, contactPerson: data.contactPerson, phone: data.phone, email: data.email, address: data.address, gstNumber: data.gstNumber, paymentTerms: data.paymentTerms },
    });
    await AuditService.logCreate(organizationId, userId, 'Supplier', supplier.id, supplier as any, req);
    return supplier;
  }

  static async getAllSuppliers(organizationId: string) {
    return prisma.supplier.findMany({
      where: { organizationId },
      include: { _count: { select: { medicines: true, purchaseOrders: true } } },
      orderBy: { name: 'asc' },
    });
  }

  static async updateSupplier(organizationId: string, supplierId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.supplier.findFirst({ where: { id: supplierId, organizationId } });
    if (!existing) throw ApiError.notFound('Supplier not found');

    const supplier = await prisma.supplier.update({ where: { id: supplierId }, data });
    await AuditService.logUpdate(organizationId, userId, 'Supplier', supplierId, existing as any, supplier as any, req);
    return supplier;
  }

  static async createPurchaseOrder(organizationId: string, data: any, userId: string, req?: Request) {
    const supplier = await prisma.supplier.findFirst({ where: { id: data.supplierId, organizationId } });
    if (!supplier) throw ApiError.notFound('Supplier not found');

    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const orderCount = await prisma.purchaseOrder.count({ where: { organizationId } });
    const orderNumber = `PO-${datePrefix}-${String(orderCount + 1).padStart(4, '0')}`;

    const totalAmount = data.items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);

    const order = await prisma.purchaseOrder.create({
      data: {
        organizationId,
        supplierId: data.supplierId,
        orderNumber,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
        totalAmount,
        notes: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: { include: { medicine: { select: { id: true, name: true } } } }, supplier: { select: { id: true, name: true } } },
    });

    await AuditService.logCreate(organizationId, userId, 'PurchaseOrder', order.id, order as any, req);
    return order;
  }

  static async getAllPurchaseOrders(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.PurchaseOrderWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.supplierId && { supplierId: query.supplierId }),
    };

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: { items: true, supplier: { select: { id: true, name: true } } },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { orders, total, page, limit };
  }
}
