import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class QueueService {
  static async createEntry(organizationId: string, data: any, userId: string, req?: Request) {
    const visit = await prisma.visit.findFirst({ where: { id: data.visitId, organizationId } });
    if (!visit) throw ApiError.notFound('Visit not found');

    const existing = await prisma.queue.findFirst({ where: { visitId: data.visitId, status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] } } });
    if (existing) throw ApiError.conflict('Patient already in queue');

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastEntry = await prisma.queue.findFirst({
      where: { organizationId, queueType: data.queueType, createdAt: { gte: startOfDay } },
      orderBy: { queueNumber: 'desc' },
      select: { queueNumber: true },
    });
    const queueNumber = (lastEntry?.queueNumber || 0) + 1;

    const waitingCount = await prisma.queue.count({
      where: { organizationId, queueType: data.queueType, status: 'WAITING' },
    });
    const estimatedMinutes = waitingCount * 15;
    const estimatedTime = new Date(Date.now() + estimatedMinutes * 60000);

    const entry = await prisma.queue.create({
      data: {
        organizationId,
        visitId: data.visitId,
        patientId: visit.patientId,
        queueType: data.queueType,
        queueNumber,
        priority: data.priority,
        doctorId: data.doctorId,
        roomId: data.roomId,
        estimatedTime,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, medicalRecordNumber: true } },
        visit: { select: { id: true, visitNumber: true, chiefComplaint: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'Queue', entry.id, entry as any, req);
    return entry;
  }

  static async getCurrentQueue(organizationId: string, queueType?: string, status?: string) {
    const where: Prisma.QueueWhereInput = {
      organizationId,
      ...(queueType && { queueType: queueType as any }),
      ...(status ? { status: status as any } : { status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] } }),
    };

    return prisma.queue.findMany({
      where,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, medicalRecordNumber: true, photo: true } },
        visit: { select: { id: true, visitNumber: true, chiefComplaint: true, priority: true } },
        room: { select: { id: true, name: true, number: true } },
      },
      orderBy: [{ priority: 'desc' }, { queueNumber: 'asc' }],
    });
  }

  static async callNext(organizationId: string, data: any, userId: string, req?: Request) {
    const nextEntry = await prisma.queue.findFirst({
      where: {
        organizationId,
        status: 'WAITING',
        ...(data.doctorId && { doctorId: data.doctorId }),
      },
      orderBy: [{ priority: 'desc' }, { queueNumber: 'asc' }],
    });

    if (!nextEntry) throw ApiError.notFound('No patients waiting in queue');

    const updated = await prisma.queue.update({
      where: { id: nextEntry.id },
      data: {
        status: 'CALLED',
        calledAt: new Date(),
        ...(data.roomId && { roomId: data.roomId }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, medicalRecordNumber: true } },
        visit: { select: { id: true, visitNumber: true, chiefComplaint: true } },
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Queue', nextEntry.id, nextEntry as any, updated as any, req);
    return updated;
  }

  static async startService(organizationId: string, queueId: string, userId: string, req?: Request) {
    const existing = await prisma.queue.findFirst({ where: { id: queueId, organizationId } });
    if (!existing) throw ApiError.notFound('Queue entry not found');

    const updated = await prisma.queue.update({
      where: { id: queueId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Queue', queueId, existing as any, updated as any, req);
    return updated;
  }

  static async completeEntry(organizationId: string, queueId: string, userId: string, req?: Request) {
    const existing = await prisma.queue.findFirst({ where: { id: queueId, organizationId } });
    if (!existing) throw ApiError.notFound('Queue entry not found');

    const waitDuration = existing.createdAt ? Math.floor((Date.now() - existing.createdAt.getTime()) / 60000) : null;

    const updated = await prisma.queue.update({
      where: { id: queueId },
      data: { status: 'COMPLETED', completedAt: new Date(), waitDuration },
    });

    await AuditService.logUpdate(organizationId, userId, 'Queue', queueId, existing as any, updated as any, req);
    return updated;
  }

  static async skipEntry(organizationId: string, queueId: string, userId: string, req?: Request) {
    const existing = await prisma.queue.findFirst({ where: { id: queueId, organizationId } });
    if (!existing) throw ApiError.notFound('Queue entry not found');

    const updated = await prisma.queue.update({
      where: { id: queueId },
      data: { status: 'SKIPPED' },
    });

    await AuditService.logUpdate(organizationId, userId, 'Queue', queueId, existing as any, updated as any, req);
    return updated;
  }

  static async getQueueStats(organizationId: string, queueType?: string) {
    const where: Prisma.QueueWhereInput = {
      organizationId,
      ...(queueType && { queueType: queueType as any }),
    };

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [waitingCount, calledCount, inProgressCount, completedToday, avgWaitTime, byType] = await Promise.all([
      prisma.queue.count({ where: { ...where, status: 'WAITING' } }),
      prisma.queue.count({ where: { ...where, status: 'CALLED' } }),
      prisma.queue.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.queue.count({ where: { ...where, status: 'COMPLETED', completedAt: { gte: startOfDay } } }),
      prisma.queue.aggregate({
        where: { ...where, status: 'COMPLETED', waitDuration: { not: null } },
        _avg: { waitDuration: true },
      }),
      prisma.queue.groupBy({
        by: ['queueType'],
        where: { createdAt: { gte: startOfDay } },
        _count: { status: true },
      }),
    ]);

    return {
      waiting: waitingCount,
      called: calledCount,
      inProgress: inProgressCount,
      completedToday,
      averageWaitTime: avgWaitTime._avg.waitDuration || 0,
      byType,
    };
  }

  static async getRealtimeQueue(organizationId: string, queueType: string) {
    const entries = await prisma.queue.findMany({
      where: {
        organizationId,
        queueType: queueType as any,
        status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, medicalRecordNumber: true } },
        room: { select: { name: true, number: true } },
      },
      orderBy: [{ priority: 'desc' }, { queueNumber: 'asc' }],
    });

    const totalWaiting = entries.filter((e) => e.status === 'WAITING').length;
    const currentPatient = entries.find((e) => e.status === 'IN_PROGRESS');
    const nextPatient = entries.find((e) => e.status === 'CALLED');

    return { entries, totalWaiting, currentPatient, nextPatient };
  }
}
