import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class DoctorService {
  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.DoctorProfileWhereInput = {
      organizationId,
      ...(query.specialty && { specialty: { contains: query.specialty, mode: 'insensitive' } }),
      ...(query.isAcceptingPatients !== undefined && { isAcceptingPatients: query.isAcceptingPatients === 'true' }),
      ...(query.search && {
        OR: [
          { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
          { specialty: { contains: query.search, mode: 'insensitive' } },
          { licenseNumber: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [doctors, total] = await Promise.all([
      prisma.doctorProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true, phone: true, email: true } },
          _count: { select: { appointments: true } },
        },
      }),
      prisma.doctorProfile.count({ where }),
    ]);

    return { doctors, total, page, limit };
  }

  static async getById(organizationId: string, doctorId: string) {
    const doctor = await prisma.doctorProfile.findFirst({
      where: { id: doctorId, organizationId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, phone: true, email: true } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { appointments: true, prescriptions: true, soapNotes: true } },
      },
    });
    if (!doctor) throw ApiError.notFound('Doctor not found');
    return doctor;
  }

  static async update(organizationId: string, doctorId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.doctorProfile.findFirst({ where: { id: doctorId, organizationId } });
    if (!existing) throw ApiError.notFound('Doctor not found');

    const doctor = await prisma.doctorProfile.update({
      where: { id: doctorId },
      data: {
        licenseNumber: data.licenseNumber,
        specialty: data.specialty,
        subSpecialty: data.subSpecialty,
        qualifications: data.qualifications,
        experience: data.experience,
        consultationFee: data.consultationFee,
        followUpFee: data.followUpFee,
        bio: data.bio,
        languages: data.languages,
        isAcceptingPatients: data.isAcceptingPatients,
        isTelemedicineEnabled: data.isTelemedicineEnabled,
        maxPatientsPerDay: data.maxPatientsPerDay,
        slotDuration: data.slotDuration,
        availableDays: data.availableDays,
        startTime: data.startTime,
        endTime: data.endTime,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'DoctorProfile', doctorId, existing as any, doctor as any, req);
    await CacheService.delPattern(`doctors:${organizationId}:*`);
    return doctor;
  }

  static async getSchedule(organizationId: string, doctorId: string) {
    const doctor = await prisma.doctorProfile.findFirst({ where: { id: doctorId, organizationId } });
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const [schedules, overrides] = await Promise.all([
      prisma.doctorSchedule.findMany({ where: { doctorId, isActive: true }, orderBy: { dayOfWeek: 'asc' } }),
      prisma.doctorScheduleOverride.findMany({
        where: { doctorId, date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 30,
      }),
    ]);

    return { schedules, overrides };
  }

  static async updateSchedule(organizationId: string, doctorId: string, data: any, userId: string, req?: Request) {
    const doctor = await prisma.doctorProfile.findFirst({ where: { id: doctorId, organizationId } });
    if (!doctor) throw ApiError.notFound('Doctor not found');

    await prisma.$transaction(async (tx) => {
      await tx.doctorSchedule.deleteMany({ where: { doctorId } });
      for (const schedule of data.schedules) {
        await tx.doctorSchedule.create({
          data: {
            doctorId,
            organizationId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            slotDuration: schedule.slotDuration,
            maxPatients: schedule.maxPatients,
            isActive: schedule.isActive,
          },
        });
      }
    });

    await AuditService.logUpdate(organizationId, userId, 'DoctorSchedule', doctorId, {}, data, req);
    return this.getSchedule(organizationId, doctorId);
  }

  static async getTodaysPatients(organizationId: string, doctorId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId,
        doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
      include: {
        patient: {
          select: {
            id: true, firstName: true, lastName: true, phone: true, photo: true,
            medicalRecordNumber: true, dateOfBirth: true, gender: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return appointments;
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
      select: { startTime: true },
    });

    const bookedTimes = new Set(existingAppointments.map((a) => a.startTime));
    const slots: { time: string; available: boolean }[] = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + slotDuration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
      const m = (currentMinutes % 60).toString().padStart(2, '0');
      const slotTime = `${h}:${m}`;
      slots.push({ time: slotTime, available: !bookedTimes.has(slotTime) });
      currentMinutes += slotDuration;
    }

    return { doctorId, date, isAvailable: true, startTime, endTime, slotDuration, slots };
  }
}
