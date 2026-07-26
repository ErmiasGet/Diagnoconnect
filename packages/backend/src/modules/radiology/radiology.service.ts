import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class RadiologyService {
  static async createRequest(organizationId: string, data: any, userId: string, req?: Request) {
    const visit = await prisma.visit.findFirst({ where: { id: data.visitId, organizationId } });
    if (!visit) throw ApiError.notFound('Visit not found');

    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, organizationId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const request = await prisma.radiologyRequest.create({
      data: {
        organizationId,
        visitId: data.visitId,
        patientId: data.patientId,
        orderedById: userId,
        modality: data.modality,
        bodyPart: data.bodyPart,
        clinicalInfo: data.clinicalInfo,
        urgency: data.urgency,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
        visit: { select: { visitNumber: true } },
        orderedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'RadiologyRequest', request.id, request as any, req);
    return request;
  }

  static async getPendingRequests(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.RadiologyRequestWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.modality && { modality: query.modality as any }),
      ...(query.urgency && { urgency: query.urgency as any }),
    };

    const [requests, total] = await Promise.all([
      prisma.radiologyRequest.findMany({
        where, skip, take: limit,
        orderBy: [{ urgency: 'desc' }, { createdAt: 'asc' }],
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
          visit: { select: { visitNumber: true } },
          orderedBy: { select: { firstName: true, lastName: true } },
          reports: true,
          images: true,
        },
      }),
      prisma.radiologyRequest.count({ where }),
    ]);

    return { requests, total, page, limit };
  }

  static async getById(organizationId: string, requestId: string) {
    const request = await prisma.radiologyRequest.findFirst({
      where: { id: requestId, organizationId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true, dateOfBirth: true, gender: true } },
        visit: { select: { visitNumber: true, chiefComplaint: true } },
        orderedBy: { select: { firstName: true, lastName: true } },
        reports: { include: { approvedBy: { select: { firstName: true, lastName: true } } } },
        images: true,
      },
    });
    if (!request) throw ApiError.notFound('Radiology request not found');
    return request;
  }

  static async uploadImage(organizationId: string, data: any, userId: string, req?: Request) {
    const request = await prisma.radiologyRequest.findFirst({ where: { id: data.requestId, organizationId } });
    if (!request) throw ApiError.notFound('Radiology request not found');

    const image = await prisma.radiologyImage.create({
      data: {
        organizationId,
        requestId: data.requestId,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        dicomUrl: data.dicomUrl,
        modality: data.modality,
        bodyPart: data.bodyPart,
        description: data.description,
      },
    });

    if (request.status === 'PENDING') {
      await prisma.radiologyRequest.update({ where: { id: data.requestId }, data: { status: 'IN_PROGRESS' } });
    }

    await AuditService.logCreate(organizationId, userId, 'RadiologyImage', image.id, image as any, req);
    return image;
  }

  static async createReport(organizationId: string, data: any, userId: string, req?: Request) {
    const request = await prisma.radiologyRequest.findFirst({ where: { id: data.requestId, organizationId } });
    if (!request) throw ApiError.notFound('Radiology request not found');

    const report = await prisma.radiologyReport.create({
      data: {
        organizationId,
        requestId: data.requestId,
        patientId: data.patientId,
        findings: data.findings,
        impression: data.impression,
        recommendation: data.recommendation,
        status: 'DRAFT',
      },
      include: { request: true },
    });

    await AuditService.logCreate(organizationId, userId, 'RadiologyReport', report.id, report as any, req);
    return report;
  }

  static async approveReport(organizationId: string, reportId: string, userId: string, req?: Request) {
    const existing = await prisma.radiologyReport.findFirst({ where: { id: reportId, organizationId } });
    if (!existing) throw ApiError.notFound('Radiology report not found');

    const report = await prisma.radiologyReport.update({
      where: { id: reportId },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });

    await prisma.radiologyRequest.update({ where: { id: existing.requestId }, data: { status: 'COMPLETED' } });

    await AuditService.logUpdate(organizationId, userId, 'RadiologyReport', reportId, existing as any, report as any, req);
    return report;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.RadiologyRequestWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.modality && { modality: query.modality as any }),
      ...(query.patientId && { patientId: query.patientId }),
    };

    const [requests, total] = await Promise.all([
      prisma.radiologyRequest.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          reports: true,
          images: true,
        },
      }),
      prisma.radiologyRequest.count({ where }),
    ]);

    return { requests, total, page, limit };
  }
}
