import cron from 'node-cron';
import prisma from '../config/database';
import logger from '../utils/logger';
import { emitToOrg } from '../socket';

export function startBackgroundJobs() {
  // Clean expired OTPs - every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await prisma.oTP.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      logger.info('Expired OTPs cleaned');
    } catch (error) {
      logger.error('OTP cleanup failed:', error);
    }
  });

  // Clean expired refresh tokens - every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      });
      logger.info('Expired refresh tokens cleaned');
    } catch (error) {
      logger.error('Refresh token cleanup failed:', error);
    }
  });

  // Mark expired appointments - every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expired = await prisma.appointment.updateMany({
        where: {
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          appointmentDate: { lt: new Date() },
        },
        data: { status: 'NO_SHOW' },
      });
      if (expired.count > 0) {
        logger.info(`Marked ${expired.count} expired appointments as NO_SHOW`);
      }
    } catch (error) {
      logger.error('Appointment cleanup failed:', error);
    }
  });

  // Send appointment reminders - every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const appointments = await prisma.appointment.findMany({
        where: {
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          appointmentDate: { gte: tomorrow, lte: endOfTomorrow },
          reminderSent: false,
        },
        include: {
          patient: { select: { firstName: true, email: true, phone: true } },
          doctor: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      });

      for (const apt of appointments) {
        await prisma.notification.create({
          data: {
            organizationId: apt.organizationId,
            userId: apt.patient.userId || '',
            title: 'Appointment Reminder',
            message: `You have an appointment tomorrow at ${apt.startTime} with Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`,
            type: 'APPOINTMENT',
            data: { appointmentId: apt.id },
          },
        });

        await prisma.appointment.update({
          where: { id: apt.id },
          data: { reminderSent: true },
        });
      }

      if (appointments.length > 0) {
        logger.info(`Sent ${appointments.length} appointment reminders`);
      }
    } catch (error) {
      logger.error('Appointment reminder job failed:', error);
    }
  });

  // Low stock alert - every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      const lowStockMedicines = await prisma.medicine.findMany({
        where: {
          isActive: true,
          currentStock: { lte: prisma.medicine.fields.reorderLevel },
        },
      });

      for (const medicine of lowStockMedicines) {
        if (medicine.currentStock <= medicine.reorderLevel) {
          emitToOrg(medicine.organizationId, 'pharmacy:low_stock', {
            medicineId: medicine.id,
            name: medicine.name,
            currentStock: medicine.currentStock,
            reorderLevel: medicine.reorderLevel,
          });
        }
      }
    } catch (error) {
      logger.error('Low stock alert job failed:', error);
    }
  });

  // Expired insurance check - daily
  cron.schedule('0 8 * * *', async () => {
    try {
      const upcomingExpiry = new Date();
      upcomingExpiry.setDate(upcomingExpiry.getDate() + 30);

      const expiringPolicies = await prisma.insurancePolicy.findMany({
        where: {
          isActive: true,
          endDate: { lte: upcomingExpiry },
        },
        include: {
          patient: { select: { firstName: true, lastName: true, userId: true } },
          provider: { select: { name: true } },
        },
      });

      for (const policy of expiringPolicies) {
        if (policy.patient.userId) {
          await prisma.notification.create({
            data: {
              title: 'Insurance Policy Expiring',
              message: `Your ${policy.provider.name} policy expires on ${policy.endDate.toLocaleDateString()}`,
              type: 'SYSTEM',
              userId: policy.patient.userId,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Insurance expiry check failed:', error);
    }
  });

  logger.info('Background jobs started');
}
