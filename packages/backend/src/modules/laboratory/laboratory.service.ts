import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class LaboratoryService {
  static async createLaboratory(organizationId: string, data: any, userId: string, req?: Request) {
    const laboratory = await prisma.laboratory.create({
      data: { organizationId, name: data.name, type: data.type, description: data.description },
    });
    await AuditService.logCreate(organizationId, userId, 'Laboratory', laboratory.id, laboratory as any, req);
    return laboratory;
  }

  static async getAllLaboratories(organizationId: string) {
    return prisma.laboratory.findMany({
      where: { organizationId },
      include: { _count: { select: { tests: true } } },
      orderBy: { name: 'asc' },
    });
  }

  static async updateLaboratory(organizationId: string, labId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.laboratory.findFirst({ where: { id: labId, organizationId } });
    if (!existing) throw ApiError.notFound('Laboratory not found');

    const lab = await prisma.laboratory.update({ where: { id: labId }, data });
    await AuditService.logUpdate(organizationId, userId, 'Laboratory', labId, existing as any, lab as any, req);
    return lab;
  }

  static async createTest(organizationId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.test.findFirst({ where: { organizationId, code: data.code } });
    if (existing) throw ApiError.conflict('Test with this code already exists');

    const test = await prisma.test.create({
      data: {
        organizationId,
        laboratoryId: data.laboratoryId,
        departmentId: data.departmentId,
        categoryId: data.categoryId,
        name: data.name,
        code: data.code,
        description: data.description,
        sampleType: data.sampleType,
        sampleVolume: data.sampleVolume,
        containerType: data.containerType,
        turnaroundTime: data.turnaroundTime,
        turnaroundUnit: data.turnaroundUnit,
        price: data.price,
        normalRange: data.normalRange,
        instructions: data.instructions,
      },
      include: { laboratory: { select: { id: true, name: true } }, category: { select: { id: true, name: true } } },
    });

    await AuditService.logCreate(organizationId, userId, 'Test', test.id, test as any, req);
    return test;
  }

  static async getAllTests(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.TestWhereInput = {
      organizationId,
      ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
      ...(query.laboratoryId && { laboratoryId: query.laboratoryId }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: { laboratory: { select: { id: true, name: true } }, category: { select: { id: true, name: true } } },
      }),
      prisma.test.count({ where }),
    ]);

    return { tests, total, page, limit };
  }

  static async updateTest(organizationId: string, testId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.test.findFirst({ where: { id: testId, organizationId } });
    if (!existing) throw ApiError.notFound('Test not found');

    const test = await prisma.test.update({ where: { id: testId }, data });
    await AuditService.logUpdate(organizationId, userId, 'Test', testId, existing as any, test as any, req);
    return test;
  }

  static async createTestCategory(organizationId: string, data: any) {
    const existing = await prisma.testCategory.findFirst({ where: { organizationId, code: data.code } });
    if (existing) throw ApiError.conflict('Category with this code already exists');

    return prisma.testCategory.create({
      data: { organizationId, name: data.name, code: data.code, description: data.description },
    });
  }

  static async getAllTestCategories(organizationId: string) {
    return prisma.testCategory.findMany({
      where: { organizationId },
      include: { _count: { select: { tests: true } } },
      orderBy: { name: 'asc' },
    });
  }

  static async createLabRequest(organizationId: string, data: any, userId: string, req?: Request) {
    const visit = await prisma.visit.findFirst({ where: { id: data.visitId, organizationId } });
    if (!visit) throw ApiError.notFound('Visit not found');

    const test = await prisma.test.findFirst({ where: { id: data.testId, organizationId } });
    if (!test) throw ApiError.notFound('Test not found');

    const request = await prisma.labRequest.create({
      data: {
        organizationId,
        visitId: data.visitId,
        testId: data.testId,
        orderedById: userId,
        clinicalInfo: data.clinicalInfo,
        urgency: data.urgency,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      },
      include: { test: true, visit: { select: { visitNumber: true } } },
    });

    // Create lab result record
    await prisma.labResult.create({
      data: {
        organizationId,
        labRequestId: request.id,
        visitId: data.visitId,
        patientId: visit.patientId,
        status: 'PENDING',
      },
    });

    await AuditService.logCreate(organizationId, userId, 'LabRequest', request.id, request as any, req);
    return request;
  }

  static async getPendingTests(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.LabRequestWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.urgency && { urgency: query.urgency as any }),
    };

    const [requests, total] = await Promise.all([
      prisma.labRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ urgency: 'desc' }, { createdAt: 'asc' }],
        include: {
          test: { select: { id: true, name: true, code: true, sampleType: true, turnaroundTime: true } },
          visit: { select: { id: true, visitNumber: true, patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } } } },
          orderedBy: { select: { id: true, firstName: true, lastName: true } },
          labResults: true,
        },
      }),
      prisma.labRequest.count({ where }),
    ]);

    return { requests, total, page, limit };
  }

  static async enterResults(organizationId: string, data: any, userId: string, req?: Request) {
    const labResult = await prisma.labResult.findFirst({ where: { id: data.labResultId, organizationId } });
    if (!labResult) throw ApiError.notFound('Lab result not found');

    await prisma.$transaction(async (tx) => {
      await tx.labResult.update({
        where: { id: data.labResultId },
        data: { status: 'IN_PROGRESS', overallNotes: data.overallNotes },
      });

      for (const result of data.results) {
        await tx.labTestResult.create({
          data: {
            organizationId,
            labResultId: data.labResultId,
            testId: result.testId,
            patientId: labResult.patientId,
            parameter: result.parameter,
            value: result.value,
            unit: result.unit,
            referenceRange: result.referenceRange,
            isAbnormal: result.isAbnormal,
            flag: result.flag,
            notes: result.notes,
            enteredById: userId,
          },
        });
      }

      await tx.labResult.update({
        where: { id: data.labResultId },
        data: { status: 'COMPLETED' },
      });

      await tx.labRequest.update({
        where: { id: labResult.labRequestId },
        data: { status: 'COMPLETED' },
      });
    });

    await AuditService.logUpdate(organizationId, userId, 'LabResult', data.labResultId, {}, data, req);
    return prisma.labResult.findFirst({ where: { id: data.labResultId }, include: { testResults: true } });
  }

  static async approveResults(organizationId: string, labResultId: string, userId: string, req?: Request) {
    const labResult = await prisma.labResult.findFirst({ where: { id: labResultId, organizationId } });
    if (!labResult) throw ApiError.notFound('Lab result not found');
    if (labResult.status !== 'COMPLETED') throw ApiError.badRequest('Results must be completed before approval');

    const updated = await prisma.labResult.update({
      where: { id: labResultId },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });

    await AuditService.logUpdate(organizationId, userId, 'LabResult', labResultId, labResult as any, updated as any, req);
    return updated;
  }

  static async getLabStats(organizationId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [pending, completed, approved, totalTests, byStatus] = await Promise.all([
      prisma.labRequest.count({ where: { organizationId, status: 'PENDING' } }),
      prisma.labRequest.count({ where: { organizationId, status: 'COMPLETED', updatedAt: { gte: startOfDay } } }),
      prisma.labResult.count({ where: { organizationId, status: 'APPROVED' } }),
      prisma.labRequest.count({ where: { organizationId } }),
      prisma.labRequest.groupBy({ by: ['status'], where: { organizationId }, _count: true }),
    ]);

    return { pending, completedToday: completed, approved, totalTests, byStatus };
  }
}
