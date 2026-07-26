import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { CacheService } from '../../config/redis';
import { Request } from 'express';

export class ReportService {
  static async getDashboardStats(organizationId: string) {
    const cacheKey = `dashboard:${organizationId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPatients,
      newPatientsThisMonth,
      todaysAppointments,
      totalRevenue,
      monthRevenue,
      pendingQueue,
      activeVisits,
      pendingLabTests,
    ] = await Promise.all([
      prisma.patient.count({ where: { organizationId } }),
      prisma.patient.count({ where: { organizationId, createdAt: { gte: startOfMonth } } }),
      prisma.appointment.count({
        where: {
          organizationId,
          appointmentDate: { gte: startOfDay, lte: new Date(startOfDay.getTime() + 86400000 - 1) },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.payment.aggregate({ where: { organizationId, status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: { organizationId, status: 'COMPLETED', paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.queue.count({ where: { organizationId, status: 'WAITING' } }),
      prisma.visit.count({ where: { organizationId, status: { in: ['IN_PROGRESS', 'IN_QUEUE', 'REGISTERED'] } } }),
      prisma.labRequest.count({ where: { organizationId, status: 'PENDING' } }),
    ]);

    const stats = {
      totalPatients,
      newPatientsThisMonth,
      todaysAppointments,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthRevenue: monthRevenue._sum.amount || 0,
      pendingQueue,
      activeVisits,
      pendingLabTests,
    };

    await CacheService.set(cacheKey, stats, 120);
    return stats;
  }

  static async getRevenueReport(organizationId: string, dateFrom: string, dateTo: string) {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const [totalRevenue, paymentsByMethod, dailyRevenue, topServices] = await Promise.all([
      prisma.payment.aggregate({
        where: { organizationId, status: 'COMPLETED', paymentDate: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where: { organizationId, status: 'COMPLETED', paymentDate: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT DATE(payment_date) as date, SUM(amount) as revenue, COUNT(*) as transactions
        FROM payments
        WHERE organization_id = ${organizationId} AND status = 'COMPLETED'
        AND payment_date >= ${start} AND payment_date <= ${end}
        GROUP BY DATE(payment_date)
        ORDER BY date ASC
      `,
      prisma.invoiceItem.groupBy({
        by: ['category'],
        where: {
          invoice: { organizationId, invoiceDate: { gte: start, lte: end } },
        },
        _sum: { totalPrice: true },
        _count: true,
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions: totalRevenue._count,
      paymentsByMethod,
      dailyRevenue,
      topServices,
    };
  }

  static async getPatientReport(organizationId: string, dateFrom: string, dateTo: string) {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const [newPatients, genderDistribution, ageGroups, topReferrers] = await Promise.all([
      prisma.patient.count({ where: { organizationId, createdAt: { gte: start, lte: end } } }),
      prisma.patient.groupBy({ by: ['gender'], where: { organizationId }, _count: true }),
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
        WHERE organization_id = ${organizationId}
        GROUP BY age_group
        ORDER BY count DESC
      `,
      prisma.visit.groupBy({
        by: ['doctorId'],
        where: { organizationId, createdAt: { gte: start, lte: end } },
        _count: true,
        orderBy: { _count: { doctorId: 'desc' } },
        take: 10,
      }),
    ]);

    return { newPatients, genderDistribution, ageGroups, topReferrers };
  }

  static async getAppointmentReport(organizationId: string, dateFrom: string, dateTo: string) {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const [total, byStatus, byType, byDoctor, dailyAppointments] = await Promise.all([
      prisma.appointment.count({ where: { organizationId, appointmentDate: { gte: start, lte: end } } }),
      prisma.appointment.groupBy({ by: ['status'], where: { organizationId, appointmentDate: { gte: start, lte: end } }, _count: true }),
      prisma.appointment.groupBy({ by: ['type'], where: { organizationId, appointmentDate: { gte: start, lte: end } }, _count: true }),
      prisma.appointment.groupBy({
        by: ['doctorId'],
        where: { organizationId, appointmentDate: { gte: start, lte: end } },
        _count: true,
        orderBy: { _count: { doctorId: 'desc' } },
        take: 10,
      }),
      prisma.$queryRaw`
        SELECT DATE(appointment_date) as date, COUNT(*) as count
        FROM appointments
        WHERE organization_id = ${organizationId}
        AND appointment_date >= ${start} AND appointment_date <= ${end}
        AND status != 'CANCELLED'
        GROUP BY DATE(appointment_date)
        ORDER BY date ASC
      `,
    ]);

    return { total, byStatus, byType, byDoctor, dailyAppointments };
  }

  static async getLabReport(organizationId: string, dateFrom: string, dateTo: string) {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const [totalRequests, completedTests, pendingTests, byTest] = await Promise.all([
      prisma.labRequest.count({ where: { organizationId, createdAt: { gte: start, lte: end } } }),
      prisma.labRequest.count({ where: { organizationId, status: 'COMPLETED', updatedAt: { gte: start, lte: end } } }),
      prisma.labRequest.count({ where: { organizationId, status: 'PENDING' } }),
      prisma.labRequest.groupBy({
        by: ['testId'],
        where: { organizationId, createdAt: { gte: start, lte: end } },
        _count: true,
        orderBy: { _count: { testId: 'desc' } },
        take: 10,
      }),
    ]);

    return { totalRequests, completedTests, pendingTests, byTest, completionRate: totalRequests > 0 ? ((completedTests / totalRequests) * 100).toFixed(1) : 0 };
  }

  static async generateReport(organizationId: string, data: any, userId: string, req?: Request) {
    const report = await prisma.report.create({
      data: {
        organizationId,
        generatedById: userId,
        reportType: data.reportType,
        title: data.title,
        parameters: data.parameters,
        status: 'GENERATED',
      },
    });

    await AuditService.logCreate(organizationId, userId, 'Report', report.id, report as any, req);
    return report;
  }

  static async getGeneratedReports(organizationId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const where = { organizationId };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { generatedBy: { select: { firstName: true, lastName: true } } },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total, page, limit };
  }
}
