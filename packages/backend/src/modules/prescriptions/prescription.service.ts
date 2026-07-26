import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class PrescriptionService {
  static async create(organizationId: string, data: any, userId: string, req?: Request) {
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, organizationId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    if (data.visitId) {
      const visit = await prisma.visit.findFirst({ where: { id: data.visitId, organizationId } });
      if (!visit) throw ApiError.notFound('Visit not found');
    }

    const prescription = await prisma.prescription.create({
      data: {
        organizationId,
        visitId: data.visitId,
        patientId: data.patientId,
        prescribedById: userId,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        notes: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
        prescribedBy: { select: { id: true, firstName: true, lastName: true } },
        visit: { select: { id: true, visitNumber: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'Prescription', prescription.id, prescription as any, req);
    return prescription;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.PrescriptionWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.patientId && { patientId: query.patientId }),
      ...(query.visitId && { visitId: query.visitId }),
      ...(query.isDispensed !== undefined && { isDispensed: query.isDispensed === 'true' }),
      ...(query.search && {
        OR: [
          { patient: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: true,
          patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
          prescribedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.prescription.count({ where }),
    ]);

    return { prescriptions, total, page, limit };
  }

  static async getById(organizationId: string, prescriptionId: string) {
    const prescription = await prisma.prescription.findFirst({
      where: { id: prescriptionId, organizationId },
      include: {
        items: { include: { medicine: { select: { id: true, name: true, sellingPrice: true, currentStock: true } } } },
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true, dateOfBirth: true, allergies: true } },
        prescribedBy: { select: { id: true, firstName: true, lastName: true } },
        dispensedBy: { select: { id: true, firstName: true, lastName: true } },
        visit: { select: { id: true, visitNumber: true } },
      },
    });
    if (!prescription) throw ApiError.notFound('Prescription not found');
    return prescription;
  }

  static async getByVisit(organizationId: string, visitId: string) {
    return prisma.prescription.findMany({
      where: { organizationId, visitId },
      include: {
        items: true,
        prescribedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getByPatient(organizationId: string, patientId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.PrescriptionWhereInput = { organizationId, patientId };

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          prescribedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.prescription.count({ where }),
    ]);

    return { prescriptions, total, page, limit };
  }

  static async dispense(organizationId: string, prescriptionId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.prescription.findFirst({ where: { id: prescriptionId, organizationId } });
    if (!existing) throw ApiError.notFound('Prescription not found');
    if (existing.status === 'CANCELLED') throw ApiError.badRequest('Cannot dispense a cancelled prescription');
    if (existing.isDispensed) throw ApiError.badRequest('Prescription already fully dispensed');

    let prescription;

    if (data.dispensedItems && data.dispensedItems.length > 0) {
      for (const item of data.dispensedItems) {
        await prisma.prescriptionItem.update({
          where: { id: item.prescriptionItemId },
          data: { isDispensed: item.isDispensed },
        });
      }

      const allItems = await prisma.prescriptionItem.findMany({ where: { prescriptionId } });
      const allDispensed = allItems.every((i) => i.isDispensed);
      const anyDispensed = allItems.some((i) => i.isDispensed);

      prescription = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          isDispensed: allDispensed,
          dispensedById: anyDispensed ? userId : undefined,
          dispensedAt: anyDispensed ? new Date() : undefined,
          status: allDispensed ? 'FULLY_DISPENSED' : anyDispensed ? 'PARTIALLY_DISPENSED' : existing.status,
        },
        include: { items: true },
      });
    } else {
      await prisma.prescriptionItem.updateMany({ where: { prescriptionId }, data: { isDispensed: true } });
      prescription = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: { isDispensed: true, dispensedById: userId, dispensedAt: new Date(), status: 'FULLY_DISPENSED' },
        include: { items: true },
      });
    }

    await AuditService.logUpdate(organizationId, userId, 'Prescription', prescriptionId, existing as any, prescription as any, req);
    return prescription;
  }

  static async cancel(organizationId: string, prescriptionId: string, userId: string, req?: Request) {
    const existing = await prisma.prescription.findFirst({ where: { id: prescriptionId, organizationId } });
    if (!existing) throw ApiError.notFound('Prescription not found');
    if (existing.isDispensed) throw ApiError.badRequest('Cannot cancel a dispensed prescription');

    const prescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { status: 'CANCELLED' },
    });

    await AuditService.logUpdate(organizationId, userId, 'Prescription', prescriptionId, existing as any, prescription as any, req);
    return prescription;
  }
}
