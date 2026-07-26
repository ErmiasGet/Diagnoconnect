import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { CacheService } from '../config/redis';
import prisma from '../config/database';
import logger from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
  userRole?: string;
}

export function setupSocketHandlers(io: SocketIOServer) {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      socket.userId = decoded.id;
      socket.organizationId = decoded.organizationId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.userId}`);

    // Join organization room
    if (socket.organizationId) {
      socket.join(`org:${socket.organizationId}`);
    }

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      CacheService.set(`online:${socket.userId}`, socket.id, 3600);
    }

    // Queue updates
    socket.on('queue:subscribe', (queueType: string) => {
      if (socket.organizationId) {
        socket.join(`queue:${socket.organizationId}:${queueType}`);
      }
    });

    socket.on('queue:unsubscribe', (queueType: string) => {
      if (socket.organizationId) {
        socket.leave(`queue:${socket.organizationId}:${queueType}`);
      }
    });

    // Chat
    socket.on('chat:join', (roomId: string) => {
      socket.join(`chat:${roomId}`);
    });

    socket.on('chat:leave', (roomId: string) => {
      socket.leave(`chat:${roomId}`);
    });

    socket.on('chat:message', async (data: { roomId: string; content: string; type?: string }) => {
      if (!socket.userId || !socket.organizationId) return;

      const message = await prisma.chatMessage.create({
        data: {
          chatRoomId: data.roomId,
          senderId: socket.userId,
          content: data.content,
          type: (data.type as any) || 'TEXT',
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      });

      io.to(`chat:${data.roomId}`).emit('chat:message', message);
    });

    // Typing indicators
    socket.on('chat:typing', (data: { roomId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.roomId}`).emit('chat:typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Real-time queue updates
    socket.on('queue:update', async (data: { queueType: string; action: string; queueId?: string }) => {
      if (!socket.organizationId) return;

      const queueData = await prisma.queue.findMany({
        where: {
          organizationId: socket.organizationId,
          queueType: data.queueType as any,
          status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] },
        },
        include: {
          patient: { select: { firstName: true, lastName: true, medicalRecordNumber: true } },
          room: { select: { name: true, number: true } },
        },
        orderBy: [{ priority: 'asc' }, { queueNumber: 'asc' }],
      });

      io.to(`queue:${socket.organizationId}:${data.queueType}`).emit('queue:update', queueData);
    });

    // Doctor notifications
    socket.on('doctor:subscribe', (doctorId: string) => {
      socket.join(`doctor:${doctorId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
      if (socket.userId) {
        CacheService.del(`online:${socket.userId}`);
      }
    });
  });

  // Export io for use in services
  (global as any).io = io;
}

export function emitToOrg(organizationId: string, event: string, data: any) {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    io.to(`org:${organizationId}`).emit(event, data);
  }
}

export function emitToUser(userId: string, event: string, data: any) {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToDoctor(doctorId: string, event: string, data: any) {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    io.to(`doctor:${doctorId}`).emit(event, data);
  }
}

export function emitToQueue(organizationId: string, queueType: string, event: string, data: any) {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    io.to(`queue:${organizationId}:${queueType}`).emit(event, data);
  }
}
