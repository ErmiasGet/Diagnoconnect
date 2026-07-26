import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class BillingService {
  static async createInvoice(organizationId: string, data: any, userId: string, req?: Request) {
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, organizationId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceCount = await prisma.invoice.count({ where: { organizationId } });
    const invoiceNumber = `INV-${datePrefix}-${String(invoiceCount + 1).padStart(4, '0')}`;

    let subtotal = 0;
    const items = data.items.map((item: any) => {
      const itemTotal = item.quantity * item.unitPrice;
      const taxAmount = item.taxRate ? (itemTotal * item.taxRate) / 100 : 0;
      subtotal += itemTotal;
      return {
        description: item.description,
        category: item.category,
        testId: item.testId,
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
        taxRate: item.taxRate || 0,
        taxAmount,
      };
    });

    const totalTax = items.reduce((sum: number, item: any) => sum + item.taxAmount, 0);
    let discountAmount = 0;
    if (data.discountType === 'PERCENTAGE' && data.discountValue) {
      discountAmount = (subtotal * data.discountValue) / 100;
    } else if (data.discountType === 'FIXED' && data.discountValue) {
      discountAmount = data.discountValue;
    }

    const totalAmount = subtotal + totalTax - discountAmount;

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        patientId: data.patientId,
        visitId: data.visitId,
        invoiceNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        subtotal,
        taxAmount: totalTax,
        discountAmount,
        totalAmount,
        balance: totalAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
        notes: data.notes,
        isInsurance: data.isInsurance,
        insuranceAmount: data.insuranceAmount || 0,
        createdById: userId,
        items: { create: items },
      },
      include: {
        items: true,
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'Invoice', invoice.id, invoice as any, req);
    return invoice;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.InvoiceWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.patientId && { patientId: query.patientId }),
      ...(query.dateFrom && { invoiceDate: { gte: new Date(query.dateFrom as string) } }),
      ...(query.dateTo && { invoiceDate: { lte: new Date(query.dateTo as string) } }),
      ...(query.search && {
        OR: [
          { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
          { patient: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
          items: true,
          payments: { select: { id: true, amount: true, method: true, status: true, paymentDate: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total, page, limit };
  }

  static async getById(organizationId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true, phone: true, email: true, address: true } },
        items: true,
        payments: { include: { processedBy: { select: { firstName: true, lastName: true } } } },
        refunds: true,
        createdBy: { select: { firstName: true, lastName: true } },
        visit: { select: { id: true, visitNumber: true } },
      },
    });
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return invoice;
  }

  static async processPayment(organizationId: string, invoiceId: string, data: any, userId: string, req?: Request) {
    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, organizationId } });
    if (!invoice) throw ApiError.notFound('Invoice not found');
    if (invoice.status === 'PAID') throw ApiError.badRequest('Invoice is already fully paid');
    if (invoice.status === 'CANCELLED') throw ApiError.badRequest('Cannot process payment for cancelled invoice');
    if (data.amount > invoice.balance.toNumber()) throw ApiError.badRequest('Payment amount exceeds outstanding balance');

    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const paymentCount = await prisma.payment.count({ where: { organizationId } });
    const paymentNumber = `PAY-${datePrefix}-${String(paymentCount + 1).padStart(4, '0')}`;

    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          organizationId,
          invoiceId,
          paymentNumber,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          transactionId: data.transactionId,
          notes: data.notes,
          processedById: userId,
          status: 'COMPLETED',
        },
      }),
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: { increment: data.amount },
          balance: { decrement: data.amount },
          status: (invoice.paidAmount.toNumber() + data.amount) >= invoice.totalAmount.toNumber() ? 'PAID' : 'PARTIALLY_PAID',
        },
      }),
    ]);

    await AuditService.logCreate(organizationId, userId, 'Payment', payment.id, payment as any, req);
    return payment;
  }

  static async createRefund(organizationId: string, invoiceId: string, data: any, userId: string, req?: Request) {
    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, organizationId } });
    if (!invoice) throw ApiError.notFound('Invoice not found');
    if (data.amount > invoice.paidAmount.toNumber()) throw ApiError.badRequest('Refund amount exceeds paid amount');

    const refund = await prisma.refund.create({
      data: { organizationId, invoiceId, amount: data.amount, reason: data.reason, status: 'PENDING' },
    });

    await AuditService.logCreate(organizationId, userId, 'Refund', refund.id, refund as any, req);
    return refund;
  }

  static async getFinancialReports(organizationId: string, dateFrom: string, dateTo: string) {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const [totalRevenue, totalPayments, totalRefunds, invoicesByStatus, paymentsByMethod, dailyRevenue] = await Promise.all([
      prisma.invoice.aggregate({ where: { organizationId, invoiceDate: { gte: start, lte: end } }, _sum: { totalAmount: true, paidAmount: true } }),
      prisma.payment.aggregate({ where: { organizationId, paymentDate: { gte: start, lte: end }, status: 'COMPLETED' }, _sum: { amount: true }, _count: true }),
      prisma.refund.aggregate({ where: { organizationId, createdAt: { gte: start, lte: end }, status: 'PROCESSED' }, _sum: { amount: true } }),
      prisma.invoice.groupBy({ by: ['status'], where: { organizationId, invoiceDate: { gte: start, lte: end } }, _count: true, _sum: { totalAmount: true } }),
      prisma.payment.groupBy({ by: ['method'], where: { organizationId, paymentDate: { gte: start, lte: end }, status: 'COMPLETED' }, _count: true, _sum: { amount: true } }),
      prisma.$queryRaw`
        SELECT DATE(invoice_date) as date, COUNT(*) as count, SUM(total_amount) as revenue
        FROM invoices
        WHERE organization_id = ${organizationId} AND invoice_date >= ${start} AND invoice_date <= ${end}
        GROUP BY DATE(invoice_date)
        ORDER BY date ASC
      `,
    ]);

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalCollected: totalRevenue._sum.paidAmount || 0,
      totalPayments: totalPayments._sum.amount || 0,
      paymentCount: totalPayments._count,
      totalRefunds: totalRefunds._sum.amount || 0,
      invoicesByStatus,
      paymentsByMethod,
      dailyRevenue,
    };
  }
}
