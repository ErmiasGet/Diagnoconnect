import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class FileService {
  static async uploadFile(organizationId: string, data: any, userId: string, req?: Request) {
    const file = await prisma.file.create({
      data: {
        organizationId,
        patientId: data.patientId,
        uploadedById: userId,
        fileName: data.fileName,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        category: data.category,
        tags: data.tags || [],
        isPublic: data.isPublic,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'File', file.id, file as any, req);
    return file;
  }

  static async getFilesByPatient(organizationId: string, patientId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.FileWhereInput = {
      organizationId,
      patientId,
      ...(query.category && { category: query.category as any }),
      ...(query.search && {
        OR: [
          { fileName: { contains: query.search, mode: 'insensitive' } },
          { originalName: { contains: query.search, mode: 'insensitive' } },
          { tags: { has: query.search } },
        ],
      }),
    };

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { patient: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.file.count({ where }),
    ]);

    return { files, total, page, limit };
  }

  static async getFileById(fileId: string, userId: string) {
    const file = await prisma.file.findFirst({
      where: { id: fileId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!file) throw ApiError.notFound('File not found');
    return file;
  }

  static async deleteFile(organizationId: string, fileId: string, userId: string, req?: Request) {
    const existing = await prisma.file.findFirst({ where: { id: fileId, organizationId } });
    if (!existing) throw ApiError.notFound('File not found');

    await prisma.file.delete({ where: { id: fileId } });
    await AuditService.logDelete(organizationId, userId, 'File', fileId, req);
    return { success: true };
  }

  static async getAllFiles(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.FileWhereInput = {
      organizationId,
      ...(query.patientId && { patientId: query.patientId }),
      ...(query.category && { category: query.category as any }),
      ...(query.search && {
        OR: [
          { fileName: { contains: query.search, mode: 'insensitive' } },
          { originalName: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.file.count({ where }),
    ]);

    return { files, total, page, limit };
  }
}
