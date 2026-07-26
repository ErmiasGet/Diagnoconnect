import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class EmrService {
  static async createMedicalRecord(organizationId: string, data: any, userId: string, req?: Request) {
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const record = await prisma.medicalRecord.create({
      data: {
        visitId: data.visitId,
        patientId: data.patientId,
        createdById: userId,
        recordType: data.recordType,
        title: data.title,
        content: data.content,
        attachments: data.attachments || [],
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'MedicalRecord', record.id, record as any, req);
    return record;
  }

  static async getMedicalRecords(organizationId: string, patientId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.MedicalRecordWhereInput = {
      patientId,
      ...(query.recordType && { recordType: query.recordType as any }),
      ...(query.visitId && { visitId: query.visitId }),
    };

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
          visit: { select: { id: true, visitNumber: true } },
        },
      }),
      prisma.medicalRecord.count({ where }),
    ]);

    return { records, total, page, limit };
  }

  static async getMedicalRecordById(recordId: string) {
    const record = await prisma.medicalRecord.findFirst({
      where: { id: recordId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        visit: { select: { id: true, visitNumber: true, visitDate: true } },
      },
    });
    if (!record) throw ApiError.notFound('Medical record not found');
    return record;
  }

  static async createSOAPNote(organizationId: string, data: any, userId: string, req?: Request) {
    const visit = await prisma.visit.findFirst({ where: { id: data.visitId, organizationId } });
    if (!visit) throw ApiError.notFound('Visit not found');

    const patient = await prisma.patient.findFirst({ where: { id: data.patientId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const note = await prisma.sOAPNote.create({
      data: {
        visitId: data.visitId,
        patientId: data.patientId,
        createdById: userId,
        doctorId: data.doctorId,
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        notes: data.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        doctor: { select: { user: { select: { firstName: true, lastName: true } }, specialty: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'SOAPNote', note.id, note as any, req);
    return note;
  }

  static async getSOAPNotes(organizationId: string, patientId: string, visitId?: string) {
    return prisma.sOAPNote.findMany({
      where: {
        patientId,
        ...(visitId && { visitId }),
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        doctor: { select: { user: { select: { firstName: true, lastName: true } }, specialty: true } },
        visit: { select: { visitNumber: true, visitDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async recordVitals(organizationId: string, data: any, userId: string, req?: Request) {
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    let bmi: number | undefined;
    if (data.weight && data.height) {
      const heightInMeters = data.height / 100;
      bmi = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const vitals = await prisma.vitalsRecord.create({
      data: {
        visitId: data.visitId,
        patientId: data.patientId,
        recordedById: userId,
        temperature: data.temperature,
        temperatureUnit: data.temperatureUnit,
        bloodPressureSystolic: data.bloodPressureSystolic,
        bloodPressureDiastolic: data.bloodPressureDiastolic,
        heartRate: data.heartRate,
        respiratoryRate: data.respiratoryRate,
        oxygenSaturation: data.oxygenSaturation,
        weight: data.weight,
        height: data.height,
        bmi,
        bloodGlucose: data.bloodGlucose,
        painScale: data.painScale,
        notes: data.notes,
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        recordedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'VitalsRecord', vitals.id, vitals as any, req);
    return vitals;
  }

  static async getVitalsHistory(patientId: string, limit: number = 50) {
    return prisma.vitalsRecord.findMany({
      where: { patientId },
      include: { recordedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }

  static async createClinicalDecisionSupport(organizationId: string, data: any, userId: string, req?: Request) {
    const cds = await prisma.clinicalDecisionSupport.create({
      data: {
        visitId: data.visitId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        type: data.type,
        input: data.input,
        suggestion: data.suggestion,
        confidence: data.confidence,
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'ClinicalDecisionSupport', cds.id, cds as any, req);
    return cds;
  }

  static async getClinicalDecisionSupports(organizationId: string, patientId: string) {
    return prisma.clinicalDecisionSupport.findMany({
      where: { patientId },
      include: {
        doctor: { select: { user: { select: { firstName: true, lastName: true } }, specialty: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
