import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class PaymentService {
  static async processPayment(organizationId: string, data: any, userId: string, req?: Request) {
    const invoice = await prisma.invoice.findFirst({ where: { id: data.invoiceId, organizationId } });
    if (!invoice) throw ApiError.notFound('Invoice not found');
    if (invoice.status === 'PAID') throw ApiError.badRequest('Invoice is already fully paid');
    if (invoice.status === 'CANCELLED') throw ApiError.badRequest('Cannot process payment for cancelled invoice');
    if (data.amount > invoice.balance.toNumber()) throw ApiError.badRequest('Payment amount exceeds outstanding balance');

    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const paymentCount = await prisma.payment.count({ where: { organizationId } });
    const paymentNumber = `PAY-${datePrefix}-${String(paymentCount + 1).padStart(4, '0')}`;

    const paymentStatus = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER'].includes(data.method) ? 'COMPLETED' : 'PENDING';

    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          organizationId,
          invoiceId: data.invoiceId,
          paymentNumber,
          amount: data.amount,
          method: data.method,
          reference: data.reference,
          transactionId: data.transactionId,
          notes: data.notes,
          processedById: userId,
          status: paymentStatus as any,
        },
      }),
      prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: { increment: data.amount },
          balance: { decrement: data.amount },
          status: (invoice.paidAmount.toNumber() + data.amount) >= invoice.totalAmount.toNumber() ? 'PAID' : 'PARTIALLY_PAID',
        },
      }),
    ]);

    await AuditService.logCreate(organizationId, userId, 'Payment', payment.id, payment as any, req);
    await CacheService.delPattern(`dashboard:${organizationId}`);

    return prisma.payment.findFirst({
      where: { id: payment.id },
      include: {
        invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, balance: true } },
        processedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  static async getPaymentHistory(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.PaymentWhereInput = {
      organizationId,
      ...(query.method && { method: query.method as any }),
      ...(query.status && { status: query.status as any }),
      ...(query.invoiceId && { invoiceId: query.invoiceId }),
      ...(query.dateFrom && { paymentDate: { gte: new Date(query.dateFrom as string) } }),
      ...(query.dateTo && { paymentDate: { lte: new Date(query.dateTo as string) } }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          invoice: { select: { id: true, invoiceNumber: true, patient: { select: { firstName: true, lastName: true } } } },
          processedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total, page, limit };
  }

  static async verifyPayment(organizationId: string, transactionId: string, gateway: string, userId: string, req?: Request) {
    const payment = await prisma.payment.findFirst({
      where: { transactionId, organizationId },
    });
    if (!payment) throw ApiError.notFound('Payment with this transaction ID not found');

    // In production, this would call the gateway API to verify
    // For now, we'll simulate verification
    if (payment.status === 'COMPLETED') {
      return { verified: true, payment };
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', gatewayResponse: { verified: true, gateway, verifiedAt: new Date() } },
    });

    const invoice = await prisma.invoice.findFirst({ where: { id: payment.invoiceId } });
    if (invoice) {
      const newPaidAmount = invoice.paidAmount.toNumber() + payment.amount.toNumber();
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balance: invoice.totalAmount.toNumber() - newPaidAmount,
          status: newPaidAmount >= invoice.totalAmount.toNumber() ? 'PAID' : 'PARTIALLY_PAID',
        },
      });
    }

    await AuditService.logUpdate(organizationId, userId, 'Payment', payment.id, payment as any, updated as any, req);
    return { verified: true, payment: updated };
  }

  static async getPaymentById(organizationId: string, paymentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, organizationId },
      include: {
        invoice: {
          include: {
            patient: { select: { firstName: true, lastName: true, medicalRecordNumber: true } },
            items: true,
          },
        },
        processedBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!payment) throw ApiError.notFound('Payment not found');
    return payment;
  }
}
