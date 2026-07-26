import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import prisma from './config/database';
import { configureMiddleware } from './middleware';
import { errorHandler } from './utils/helpers';
import logger from './utils/logger';
import { setupSocketHandlers } from './socket';
import { startBackgroundJobs } from './jobs';

// Import all routes
import { authRoutes } from './modules/auth';
import { patientRoutes } from './modules/patients';
import { visitRoutes } from './modules/visits';
import { appointmentRoutes } from './modules/appointments';
import { queueRoutes } from './modules/queue';
import { doctorRoutes } from './modules/doctors';
import { departmentRoutes } from './modules/departments';
import { roomRoutes } from './modules/rooms';
import { prescriptionRoutes } from './modules/prescriptions';
import { laboratoryRoutes } from './modules/laboratory';
import { radiologyRoutes } from './modules/radiology';
import { pharmacyRoutes } from './modules/pharmacy';
import { billingRoutes } from './modules/billing';
import { insuranceRoutes } from './modules/insurance';
import { emrRoutes } from './modules/emr';
import { notificationRoutes } from './modules/notifications';
import { reportRoutes } from './modules/reports';
import { chatRoutes } from './modules/chat';
import { fileRoutes } from './modules/files';
import { paymentRoutes } from './modules/payments';
import { settingsRoutes } from './modules/settings';

const app = express();
const httpServer = createServer(app);

// Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Configure middleware
configureMiddleware(app);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API Routes
const apiPrefix = '/api/v1';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/patients`, patientRoutes);
app.use(`${apiPrefix}/visits`, visitRoutes);
app.use(`${apiPrefix}/appointments`, appointmentRoutes);
app.use(`${apiPrefix}/queue`, queueRoutes);
app.use(`${apiPrefix}/doctors`, doctorRoutes);
app.use(`${apiPrefix}/departments`, departmentRoutes);
app.use(`${apiPrefix}/rooms`, roomRoutes);
app.use(`${apiPrefix}/prescriptions`, prescriptionRoutes);
app.use(`${apiPrefix}/laboratory`, laboratoryRoutes);
app.use(`${apiPrefix}/radiology`, radiologyRoutes);
app.use(`${apiPrefix}/pharmacy`, pharmacyRoutes);
app.use(`${apiPrefix}/billing`, billingRoutes);
app.use(`${apiPrefix}/insurance`, insuranceRoutes);
app.use(`${apiPrefix}/emr`, emrRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/reports`, reportRoutes);
app.use(`${apiPrefix}/chat`, chatRoutes);
app.use(`${apiPrefix}/files`, fileRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/settings`, settingsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Error handler
app.use(errorHandler);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Start background jobs
startBackgroundJobs();

// Start server
async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    httpServer.listen(config.port, () => {
      logger.info(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   DiagnoConnect API Server                           ║
║   Running on port ${config.port}                              ║
║   Environment: ${config.nodeEnv.padEnd(36)}║
║                                                      ║
╚══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

main();

export { app, io };
