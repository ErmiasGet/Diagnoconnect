import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class SettingsService {
  static async getOrgSettings(organizationId: string) {
    const cacheKey = `org_settings:${organizationId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const [organization, settings] = await Promise.all([
      prisma.organization.findFirst({
        where: { id: organizationId },
        select: {
          id: true, name: true, slug: true, type: true, logo: true, coverImage: true,
          phone: true, email: true, website: true, address: true, city: true, state: true,
          country: true, timezone: true, currency: true, taxRate: true, settings: true,
          branding: true, isActive: true, isVerified: true,
        },
      }),
      prisma.organizationSetting.findMany({
        where: { organizationId },
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      }),
    ]);

    if (!organization) throw ApiError.notFound('Organization not found');

    const result = { organization, settings };
    await CacheService.set(cacheKey, result, 300);
    return result;
  }

  static async updateOrgSettings(organizationId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.organization.findFirst({ where: { id: organizationId } });
    if (!existing) throw ApiError.notFound('Organization not found');

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        logo: data.logo,
        coverImage: data.coverImage,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        timezone: data.timezone,
        currency: data.currency,
        taxRate: data.taxRate,
        settings: data.settings,
        branding: data.branding,
      },
      select: {
        id: true, name: true, slug: true, type: true, logo: true, coverImage: true,
        phone: true, email: true, website: true, address: true, city: true, state: true,
        country: true, timezone: true, currency: true, taxRate: true, settings: true,
        branding: true,
      },
    });

    await AuditService.logUpdate(organizationId, userId, 'Organization', organizationId, existing as any, organization as any, req);
    await CacheService.del(`org_settings:${organizationId}`);
    return organization;
  }

  static async getSetting(organizationId: string, key: string) {
    const setting = await prisma.organizationSetting.findFirst({
      where: { organizationId, key },
    });
    return setting;
  }

  static async upsertSetting(organizationId: string, data: any, userId: string, req?: Request) {
    const existing = await prisma.organizationSetting.findFirst({ where: { organizationId, key: data.key } });

    let setting;
    if (existing) {
      setting = await prisma.organizationSetting.update({
        where: { id: existing.id },
        data: { value: data.value, category: data.category, description: data.description },
      });
      await AuditService.logUpdate(organizationId, userId, 'OrganizationSetting', existing.id, existing as any, setting as any, req);
    } else {
      setting = await prisma.organizationSetting.create({
        data: {
          organizationId,
          key: data.key,
          value: data.value,
          category: data.category,
          description: data.description,
        },
      });
      await AuditService.logCreate(organizationId, userId, 'OrganizationSetting', setting.id, setting as any, req);
    }

    await CacheService.del(`org_settings:${organizationId}`);
    return setting;
  }

  static async bulkUpdateSettings(organizationId: string, data: any, userId: string, req?: Request) {
    const results = await prisma.$transaction(async (tx) => {
      const updated: any[] = [];
      for (const item of data.settings) {
        const existing = await tx.organizationSetting.findFirst({ where: { organizationId, key: item.key } });
        if (existing) {
          const result = await tx.organizationSetting.update({
            where: { id: existing.id },
            data: { value: item.value, category: item.category, description: item.description },
          });
          updated.push(result);
        } else {
          const result = await tx.organizationSetting.create({
            data: {
              organizationId,
              key: item.key,
              value: item.value,
              category: item.category,
              description: item.description,
            },
          });
          updated.push(result);
        }
      }
      return updated;
    });

    await AuditService.logUpdate(organizationId, userId, 'OrganizationSettings', organizationId, {}, { bulkUpdate: data.settings.length } as any, req);
    await CacheService.del(`org_settings:${organizationId}`);
    return results;
  }

  static async getAllSettings(organizationId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.OrganizationSettingWhereInput = {
      organizationId,
      ...(query.category && { category: query.category }),
      ...(query.search && {
        OR: [
          { key: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [settings, total] = await Promise.all([
      prisma.organizationSetting.findMany({ where, skip, take: limit, orderBy: { key: 'asc' } }),
      prisma.organizationSetting.count({ where }),
    ]);

    return { settings, total, page, limit };
  }

  static async deleteSetting(organizationId: string, settingId: string, userId: string, req?: Request) {
    const existing = await prisma.organizationSetting.findFirst({ where: { id: settingId, organizationId } });
    if (!existing) throw ApiError.notFound('Setting not found');

    await prisma.organizationSetting.delete({ where: { id: settingId } });
    await AuditService.logDelete(organizationId, userId, 'OrganizationSetting', settingId, req);
    await CacheService.del(`org_settings:${organizationId}`);
    return { success: true };
  }
}
