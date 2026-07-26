import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { TokenService } from '../../utils/tokens';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class PatientService {
  static async create(organizationId: string, data: any, userId?: string, req?: Request) {
    const mrn = TokenService.generateMedicalRecordNumber();

    const patient = await prisma.patient.create({
      data: {
        organizationId,
        medicalRecordNumber: mrn,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        maritalStatus: data.maritalStatus,
        nationality: data.nationality,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        email: data.email,
        address: data.address,
        occupation: data.occupation,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
        insuranceCardNumber: data.insuranceCardNumber,
        allergies: data.allergies || [],
        chronicConditions: data.chronicConditions || [],
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianRelation: data.guardianRelation,
        notes: data.notes,
        userId: userId,
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'Patient', patient.id, patient as any, req);
    await CacheService.delPattern(`patients:${organizationId}:*`);

    return patient;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.PatientWhereInput = {
      organizationId,
      ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
      ...(query.gender && { gender: query.gender as any }),
      ...(query.bloodGroup && { bloodGroup: query.bloodGroup as any }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { medicalRecordNumber: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          medicalRecordNumber: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          bloodGroup: true,
          phone: true,
          email: true,
          photo: true,
          insuranceProvider: true,
          isActive: true,
          totalVisits: true,
          lastVisitAt: true,
          createdAt: true,
        },
      }),
      prisma.patient.count({ where }),
    ]);

    return { patients, total, page, limit };
  }

  static async getById(organizationId: string, patientId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, organizationId },
      include: {
        visits: {
          take: 10,
          orderBy: { visitDate: 'desc' },
          select: {
            id: true,
            visitNumber: true,
            visitDate: true,
            status: true,
            diagnosis: true,
            doctor: { select: { firstName: true, lastName: true } },
          },
        },
        appointments: {
          take: 5,
          orderBy: { appointmentDate: 'desc' },
          where: { status: { in: ['SCHEDULED', 'CONFIRMED'] } },
          select: {
            id: true,
            appointmentDate: true,
            startTime: true,
            status: true,
            doctor: {
              select: {
                user: { select: { firstName: true, lastName: true } },
                specialty: true,
              },
            },
          },
        },
        emergencyContacts: true,
        _count: {
          select: { visits: true, appointments: true, prescriptions: true, invoices: true },
        },
      },
    });

    if (!patient) throw ApiError.notFound('Patient not found');
    return patient;
  }

  static async update(organizationId: string, patientId: string, data: any, userId?: string, req?: Request) {
    const existing = await prisma.patient.findFirst({
      where: { id: patientId, organizationId },
    });

    if (!existing) throw ApiError.notFound('Patient not found');

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Patient', patientId, existing as any, patient as any, req);
    await CacheService.delPattern(`patients:${organizationId}:*`);

    return patient;
  }

  static async getMedicalHistory(organizationId: string, patientId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, organizationId },
      include: {
        visits: {
          orderBy: { visitDate: 'desc' },
          select: {
            id: true,
            visitNumber: true,
            visitDate: true,
            status: true,
            chiefComplaint: true,
            diagnosis: true,
            notes: true,
            doctor: { select: { firstName: true, lastName: true, doctorProfile: { select: { specialty: true } } } },
            prescriptions: {
              select: {
                id: true,
                issuedDate: true,
                items: { select: { medicineName: true, dosage: true, frequency: true, duration: true } },
              },
            },
            labResults: {
              select: {
                id: true,
                resultDate: true,
                status: true,
                labRequest: { select: { test: { select: { name: true } } } },
                testResults: true,
              },
            },
            radiologyReports: {
              select: {
                id: true,
                findings: true,
                impression: true,
                status: true,
                createdAt: true,
              },
            },
            vitalsRecords: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
            },
          },
        },
        medicalRecords: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        vaccinationRecords: {
          orderBy: { dateGiven: 'desc' },
        },
      },
    });

    if (!patient) throw ApiError.notFound('Patient not found');
    return patient;
  }

  static async getStats(organizationId: string) {
    const cacheKey = `patient_stats:${organizationId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const [totalPatients, newThisMonth, genderDistribution, ageGroups] = await Promise.all([
      prisma.patient.count({ where: { organizationId } }),
      prisma.patient.count({
        where: {
          organizationId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.patient.groupBy({
        by: ['gender'],
        where: { organizationId },
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT
          CASE
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 18 THEN 'Children'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 18 AND 35 THEN 'Young Adults'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 36 AND 55 THEN 'Middle Aged'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 56 AND 75 THEN 'Seniors'
            ELSE 'Elderly'
          END as age_group,
          COUNT(*) as count
        FROM patients
        WHERE organization_id = ${organizationId} AND is_active = true
        GROUP BY age_group
        ORDER BY count DESC
      `,
    ]);

    const stats = { totalPatients, newThisMonth, genderDistribution, ageGroups };
    await CacheService.set(cacheKey, stats, 300);
    return stats;
  }
}
