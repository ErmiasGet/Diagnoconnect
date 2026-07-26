import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class RoomService {
  static async create(organizationId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.room.findFirst({ where: { organizationId, number: data.number } });
    if (existing) throw ApiError.conflict('Room with this number already exists');

    if (data.departmentId) {
      const dept = await prisma.department.findFirst({ where: { id: data.departmentId, organizationId } });
      if (!dept) throw ApiError.notFound('Department not found');
    }

    const room = await prisma.room.create({
      data: {
        organizationId,
        name: data.name,
        number: data.number,
        type: data.type,
        departmentId: data.departmentId,
        floor: data.floor,
        capacity: data.capacity,
      },
      include: { department: { select: { id: true, name: true } } },
    });

    await AuditService.logCreate(organizationId, userId, 'Room', room.id, room as any, req);
    await CacheService.delPattern(`rooms:${organizationId}:*`);
    return room;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.RoomWhereInput = {
      organizationId,
      ...(query.type && { type: query.type as any }),
      ...(query.departmentId && { departmentId: query.departmentId }),
      ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { number: { contains: query.search } },
        ],
      }),
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { department: { select: { id: true, name: true } } },
      }),
      prisma.room.count({ where }),
    ]);

    return { rooms, total, page, limit };
  }

  static async getById(organizationId: string, roomId: string) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, organizationId },
      include: {
        department: { select: { id: true, name: true } },
        queues: { where: { status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] } }, include: { patient: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!room) throw ApiError.notFound('Room not found');
    return room;
  }

  static async update(organizationId: string, roomId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.room.findFirst({ where: { id: roomId, organizationId } });
    if (!existing) throw ApiError.notFound('Room not found');

    if (data.number && data.number !== existing.number) {
      const duplicate = await prisma.room.findFirst({ where: { organizationId, number: data.number, id: { not: roomId } } });
      if (duplicate) throw ApiError.conflict('Room with this number already exists');
    }

    const room = await prisma.room.update({ where: { id: roomId }, data, include: { department: { select: { id: true, name: true } } } });
    await AuditService.logUpdate(organizationId, userId, 'Room', roomId, existing as any, room as any, req);
    await CacheService.delPattern(`rooms:${organizationId}:*`);
    return room;
  }

  static async delete(organizationId: string, roomId: string, userId: string, req?: Request) {
    const existing = await prisma.room.findFirst({ where: { id: roomId, organizationId } });
    if (!existing) throw ApiError.notFound('Room not found');

    const queueCount = await prisma.queue.count({ where: { roomId } });
    if (queueCount > 0) throw ApiError.badRequest('Cannot delete room with active queue entries');

    await prisma.room.delete({ where: { id: roomId } });
    await AuditService.logDelete(organizationId, userId, 'Room', roomId, req);
    await CacheService.delPattern(`rooms:${organizationId}:*`);
  }
}
