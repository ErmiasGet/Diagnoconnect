import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class InsuranceService {
  static async createProvider(organizationId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.insuranceProvider.findFirst({ where: { organizationId, code: data.code } });
    if (existing) throw ApiError.conflict('Insurance provider with this code already exists');

    const provider = await prisma.insuranceProvider.create({
      data: {
        organizationId, name: data.name, code: data.code, contactPerson: data.contactPerson,
        phone: data.phone, email: data.email, address: data.address,
        claimSubmissionMethod: data.claimSubmissionMethod, reimbursementRate: data.reimbursementRate,
      },
    });

    await AuditService.logCreate(organizationId, userId, 'InsuranceProvider', provider.id, provider as any, req);
    return provider;
  }

  static async getAllProviders(organizationId: string) {
    return prisma.insuranceProvider.findMany({
      where: { organizationId },
      include: { _count: { select: { policies: true, claims: true } } },
      orderBy: { name: 'asc' },
    });
  }

  static async updateProvider(organizationId: string, providerId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.insuranceProvider.findFirst({ where: { id: providerId, organizationId } });
    if (!existing) throw ApiError.notFound('Insurance provider not found');

    const provider = await prisma.insuranceProvider.update({ where: { id: providerId }, data });
    await AuditService.logUpdate(organizationId, userId, 'InsuranceProvider', providerId, existing as any, provider as any, req);
    return provider;
  }

  static async createPolicy(organizationId: string, data: any, userId: string, req?: Request) {
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, organizationId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const provider = await prisma.insuranceProvider.findFirst({ where: { id: data.providerId, organizationId } });
    if (!provider) throw ApiError.notFound('Insurance provider not found');

    const policy = await prisma.insurancePolicy.create({
      data: {
        organizationId, patientId: data.patientId, providerId: data.providerId,
        policyNumber: data.policyNumber, policyType: data.policyType,
        startDate: new Date(data.startDate), endDate: new Date(data.endDate),
        coverageAmount: data.coverageAmount, copayPercent: data.copayPercent,
        deductible: data.deductible,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        provider: { select: { id: true, name: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'InsurancePolicy', policy.id, policy as any, req);
    return policy;
  }

  static async getPolicies(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.InsurancePolicyWhereInput = {
      organizationId,
      ...(query.patientId && { patientId: query.patientId }),
      ...(query.providerId && { providerId: query.providerId }),
      ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
    };

    const [policies, total] = await Promise.all([
      prisma.insurancePolicy.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          provider: { select: { id: true, name: true } },
        },
      }),
      prisma.insurancePolicy.count({ where }),
    ]);

    return { policies, total, page, limit };
  }

  static async submitClaim(organizationId: string, data: any, userId: string, req?: Request) {
    const policy = await prisma.insurancePolicy.findFirst({ where: { id: data.policyId, organizationId } });
    if (!policy) throw ApiError.notFound('Insurance policy not found');
    if (!policy.isActive) throw ApiError.badRequest('Insurance policy is not active');
    if (new Date() > policy.endDate) throw ApiError.badRequest('Insurance policy has expired');

    const today = new Date();
    const claimCount = await prisma.insuranceClaim.count({ where: { organizationId } });
    const claimNumber = `CLM-${today.toISOString().slice(0, 10).replace(/-/g, '')}-${String(claimCount + 1).padStart(4, '0')}`;

    const claim = await prisma.insuranceClaim.create({
      data: {
        organizationId, policyId: data.policyId, providerId: data.providerId,
        patientId: data.patientId, visitId: data.visitId, claimNumber,
        treatmentDate: data.treatmentDate ? new Date(data.treatmentDate) : undefined,
        diagnosisCode: data.diagnosisCode, diagnosis: data.diagnosis,
        treatmentDescription: data.treatmentDescription, totalAmount: data.totalAmount,
        submittedById: userId, status: 'SUBMITTED',
      },
      include: {
        policy: { select: { policyNumber: true } },
        provider: { select: { name: true } },
        patient: { select: { firstName: true, lastName: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'InsuranceClaim', claim.id, claim as any, req);
    return claim;
  }

  static async getClaims(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.InsuranceClaimWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.providerId && { providerId: query.providerId }),
      ...(query.patientId && { patientId: query.patientId }),
    };

    const [claims, total] = await Promise.all([
      prisma.insuranceClaim.findMany({
        where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: {
          policy: { select: { policyNumber: true } },
          provider: { select: { name: true } },
          patient: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.insuranceClaim.count({ where }),
    ]);

    return { claims, total, page, limit };
  }

  static async reviewClaim(organizationId: string, claimId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.insuranceClaim.findFirst({ where: { id: claimId, organizationId } });
    if (!existing) throw ApiError.notFound('Insurance claim not found');

    const claim = await prisma.insuranceClaim.update({
      where: { id: claimId },
      data: {
        status: data.status,
        approvedAmount: data.approvedAmount,
        reviewNotes: data.reviewNotes,
        reviewedById: userId,
        reviewedAt: new Date(),
        ...(data.status === 'SETTLED' ? { settledAt: new Date() } : {}),
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'InsuranceClaim', claimId, existing as any, claim as any, req);
    return claim;
  }
}
