import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class AppointmentService {
  static async create(organizationId: string, data: any, userId: string, req?: Request) {
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, organizationId } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const doctor = await prisma.doctorProfile.findFirst({ where: { id: data.doctorId, organizationId } });
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'] },
      },
    });
    if (conflict) throw ApiError.conflict('Doctor is not available at this time slot');

    const appointment = await prisma.appointment.create({
      data: {
        organizationId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        type: data.type,
        reason: data.reason,
        notes: data.notes,
        consultationFee: data.consultationFee || doctor.consultationFee,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, photo: true } },
        doctor: { select: { id: true, specialty: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'Appointment', appointment.id, appointment as any, req);
    await CacheService.delPattern(`appointments:${organizationId}:*`);
    return appointment;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.AppointmentWhereInput = {
      organizationId,
      ...(query.status && { status: query.status as any }),
      ...(query.type && { type: query.type as any }),
      ...(query.doctorId && { doctorId: query.doctorId }),
      ...(query.patientId && { patientId: query.patientId }),
      ...(query.dateFrom && { appointmentDate: { gte: new Date(query.dateFrom as string) } }),
      ...(query.dateTo && { appointmentDate: { lte: new Date(query.dateTo as string) } }),
      ...(query.today && {
        appointmentDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      ...(query.search && {
        OR: [
          { patient: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: query.search, mode: 'insensitive' } } },
          { patient: { phone: { contains: query.search } } },
        ],
      }),
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, phone: true, photo: true } },
          doctor: { select: { id: true, specialty: true, user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, total, page, limit };
  }

  static async getById(organizationId: string, appointmentId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, organizationId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, photo: true, medicalRecordNumber: true } },
        doctor: { select: { id: true, specialty: true, consultationFee: true, user: { select: { firstName: true, lastName: true } } } },
        visit: { select: { id: true, visitNumber: true, status: true } },
      },
    });
    if (!appointment) throw ApiError.notFound('Appointment not found');
    return appointment;
  }

  static async update(organizationId: string, appointmentId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.appointment.findFirst({ where: { id: appointmentId, organizationId } });
    if (!existing) throw ApiError.notFound('Appointment not found');

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...data,
        appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
        cancelledAt: data.status === 'CANCELLED' ? new Date() : undefined,
        checkedInAt: data.status === 'CHECKED_IN' ? new Date() : undefined,
        startedAt: data.status === 'IN_PROGRESS' ? new Date() : undefined,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, specialty: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Appointment', appointmentId, existing as any, appointment as any, req);
    await CacheService.delPattern(`appointments:${organizationId}:*`);
    return appointment;
  }

  static async cancel(organizationId: string, appointmentId: string, cancellationReason: string, userId: string, req?: Request) {
    const existing = await prisma.appointment.findFirst({ where: { id: appointmentId, organizationId } });
    if (!existing) throw ApiError.notFound('Appointment not found');
    if (existing.status === 'CANCELLED') throw ApiError.badRequest('Appointment already cancelled');
    if (existing.status === 'COMPLETED') throw ApiError.badRequest('Cannot cancel a completed appointment');

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });

    await AuditService.logUpdate(organizationId, userId, 'Appointment', appointmentId, existing as any, appointment as any, req);
    await CacheService.delPattern(`appointments:${organizationId}:*`);
    return appointment;
  }

  static async reschedule(organizationId: string, appointmentId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.appointment.findFirst({ where: { id: appointmentId, organizationId } });
    if (!existing) throw ApiError.notFound('Appointment not found');
    if (existing.status === 'CANCELLED' || existing.status === 'COMPLETED') {
      throw ApiError.badRequest('Cannot reschedule this appointment');
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: existing.doctorId,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        id: { not: appointmentId },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'] },
      },
    });
    if (conflict) throw ApiError.conflict('Doctor is not available at the new time slot');

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'RESCHEDULED',
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, specialty: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Appointment', appointmentId, existing as any, appointment as any, req);
    await CacheService.delPattern(`appointments:${organizationId}:*`);
    return appointment;
  }

  static async checkIn(organizationId: string, appointmentId: string, userId: string, req?: Request) {
    const existing = await prisma.appointment.findFirst({ where: { id: appointmentId, organizationId } });
    if (!existing) throw ApiError.notFound('Appointment not found');
    if (existing.status !== 'SCHEDULED' && existing.status !== 'CONFIRMED') {
      throw ApiError.badRequest('Only scheduled or confirmed appointments can be checked in');
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CHECKED_IN', checkedInAt: new Date() },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        doctor: { select: { id: true, specialty: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Appointment', appointmentId, existing as any, appointment as any, req);
    return appointment;
  }

  static async getAvailability(organizationId: string, doctorId: string, date: string) {
    const doctor = await prisma.doctorProfile.findFirst({ where: { id: doctorId, organizationId } });
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const targetDate = new Date(date);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()];

    const schedule = await prisma.doctorSchedule.findFirst({ where: { doctorId, dayOfWeek: dayName, isActive: true } });
    const override = await prisma.doctorScheduleOverride.findFirst({ where: { doctorId, date: targetDate } });

    if (override && !override.isAvailable) {
      return { doctorId, date, isAvailable: false, reason: override.reason, slots: [] };
    }

    const startTime = override?.startTime || schedule?.startTime || doctor.startTime || '09:00';
    const endTime = override?.endTime || schedule?.endTime || doctor.endTime || '17:00';
    const slotDuration = doctor.slotDuration || schedule?.slotDuration || 30;

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: targetDate,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] },
      },
      select: { startTime: true, endTime: true },
    });

    const slots: { time: string; available: boolean }[] = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + slotDuration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
      const m = (currentMinutes % 60).toString().padStart(2, '0');
      const slotTime = `${h}:${m}`;
      const slotEndMinutes = currentMinutes + slotDuration;
      const eh = Math.floor(slotEndMinutes / 60).toString().padStart(2, '0');
      const em = (slotEndMinutes % 60).toString().padStart(2, '0');
      const slotEnd = `${eh}:${em}`;

      const isBooked = existingAppointments.some((a) => a.startTime === slotTime);
      slots.push({ time: slotTime, available: !isBooked });
      currentMinutes += slotDuration;
    }

    return { doctorId, date, isAvailable: true, startTime, endTime, slotDuration, slots };
  }

  static async getTodaysAppointments(organizationId: string, doctorId?: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return prisma.appointment.findMany({
      where: {
        organizationId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        ...(doctorId && { doctorId }),
        status: { not: 'CANCELLED' },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, photo: true } },
        doctor: { select: { id: true, specialty: true, user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  static async getByDoctor(organizationId: string, doctorId: string, date: string) {
    const targetDate = new Date(date);
    return prisma.appointment.findMany({
      where: {
        organizationId,
        doctorId,
        appointmentDate: targetDate,
        status: { not: 'CANCELLED' },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, photo: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  static async getByPatient(organizationId: string, patientId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.AppointmentWhereInput = {
      organizationId,
      patientId,
      ...(query.status && { status: query.status as any }),
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          doctor: { select: { id: true, specialty: true, user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, total, page, limit };
  }
}
