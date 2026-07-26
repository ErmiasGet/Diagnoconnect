import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class DepartmentService {
  static async create(organizationId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.department.findFirst({ where: { organizationId, code: data.code } });
    if (existing) throw ApiError.conflict('Department with this code already exists');

    const department = await prisma.department.create({
      data: { organizationId, name: data.name, code: data.code, description: data.description, color: data.color, icon: data.icon, sortOrder: data.sortOrder },
    });

    await AuditService.logCreate(organizationId, userId, 'Department', department.id, department as any, req);
    await CacheService.delPattern(`departments:${organizationId}:*`);
    return department;
  }

  static async getAll(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(query);

    const where: Prisma.DepartmentWhereInput = {
      organizationId,
      ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { visits: true, rooms: true, doctorProfiles: true } } },
      }),
      prisma.department.count({ where }),
    ]);

    return { departments, total, page, limit };
  }

  static async getById(organizationId: string, departmentId: string) {
    const department = await prisma.department.findFirst({
      where: { id: departmentId, organizationId },
      include: {
        rooms: { orderBy: { name: 'asc' } },
        doctorProfiles: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        },
        _count: { select: { visits: true, rooms: true, doctorProfiles: true } },
      },
    });
    if (!department) throw ApiError.notFound('Department not found');
    return department;
  }

  static async update(organizationId: string, departmentId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
    if (!existing) throw ApiError.notFound('Department not found');

    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.department.findFirst({ where: { organizationId, code: data.code, id: { not: departmentId } } });
      if (duplicate) throw ApiError.conflict('Department with this code already exists');
    }

    const department = await prisma.department.update({ where: { id: departmentId }, data });

    await AuditService.logUpdate(organizationId, userId, 'Department', departmentId, existing as any, department as any, req);
    await CacheService.delPattern(`departments:${organizationId}:*`);
    return department;
  }

  static async delete(organizationId: string, departmentId: string, userId: string, req?: Request) {
    const existing = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
    if (!existing) throw ApiError.notFound('Department not found');

    const visitCount = await prisma.visit.count({ where: { departmentId } });
    if (visitCount > 0) throw ApiError.badRequest('Cannot delete department with associated visits. Deactivate instead.');

    await prisma.department.delete({ where: { id: departmentId } });
    await AuditService.logDelete(organizationId, userId, 'Department', departmentId, req);
    await CacheService.delPattern(`departments:${organizationId}:*`);
  }
}
