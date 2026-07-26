import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class VisitService {
  static async create(organizationId: string, data: any, userId: string, req?: Request) {
    // Verify patient exists
    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) throw ApiError.notFound('Patient not found');

    // Generate visit number
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    const visitCount = await prisma.visit.count({
      where: { organizationId, createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) } },
    });
    const visitNumber = `V-${datePrefix}-${String(visitCount + 1).padStart(4, '0')}`;

    const visit = await prisma.visit.create({
      data: {
        organizationId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        visitNumber,
        type: data.type || 'OPD',
        status: 'REGISTERED',
        departmentId: data.departmentId,
        doctorId: data.doctorId,
        chiefComplaint: data.chiefComplaint,
        symptoms: data.symptoms,
        priority: data.priority || 'NORMAL',
        isInsurance: data.isInsurance || false,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNo: data.insurancePolicyNo,
        createdByUserId: userId,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true, photo: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        department: { select: { id: true, name: true } },
      },
    });

    // Update patient visit count
    await prisma.patient.update({
      where: { id: data.patientId },
      data: { totalVisits: { increment: 1 }, lastVisitAt: new Date() },
    });

    await AuditService.logCreate(organizationId, userId, 'Visit', visit.id, visit as any, req);
    return visit;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.VisitWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.type && { type: query.type as any }),
      ...(query.priority && { priority: query.priority as any }),
      ...(query.doctorId && { doctorId: query.doctorId }),
      ...(query.patientId && { patientId: query.patientId }),
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.dateFrom && { visitDate: { gte: new Date(query.dateFrom as string) } }),
      ...(query.dateTo && { visitDate: { lte: new Date(query.dateTo as string) } }),
      ...(query.today && {
        visitDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      ...(query.search && {
        OR: [
          { visitNumber: { contains: query.search, mode: 'insensitive' } },
          { patient: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true, photo: true } },
          doctor: { select: { id: true, firstName: true, lastName: true } },
          department: { select: { id: true, name: true } },
          _count: { select: { prescriptions: true, labResults: true, invoices: true } },
        },
      }),
      prisma.visit.count({ where }),
    ]);

    return { visits, total, page, limit };
  }

  static async getById(organizationId: string, visitId: string) {
    const visit = await prisma.visit.findFirst({
      where: { id: visitId, organizationId },
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, medicalRecordNumber: true,
            dateOfBirth: true, gender: true, bloodGroup: true, phone: true,
            allergies: true, chronicConditions: true, photo: true,
          },
        },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        department: { select: { id: true, name: true } },
        prescriptions: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        labResults: {
          include: { labRequest: { include: { test: true } }, testResults: true },
          orderBy: { createdAt: 'desc' },
        },
        radiologyReports: {
          orderBy: { createdAt: 'desc' },
        },
        soapNotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        vitalsRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 3,
        },
        invoices: {
          include: { items: true, payments: true },
        },
      },
    });

    if (!visit) throw ApiError.notFound('Visit not found');
    return visit;
  }

  static async updateStatus(organizationId: string, visitId: string, status: string, userId: string, req?: Request) {
    const visit = await prisma.visit.findFirst({
      where: { id: visitId, organizationId },
    });
    if (!visit) throw ApiError.notFound('Visit not found');

    const updated = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: status as any,
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Visit', visitId, visit as any, updated as any, req);
    return updated;
  }

  static async getTodayVisits(organizationId: string, doctorId?: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const where: Prisma.VisitWhereInput = {
      organizationId,
      visitDate: { gte: startOfDay, lte: endOfDay },
      ...(doctorId && { doctorId }),
    };

    return prisma.visit.findMany({
      where,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true, phone: true } },
        department: { select: { name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }
}
