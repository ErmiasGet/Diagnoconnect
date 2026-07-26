import prisma from '../../config/database';
import { ApiError, getPagination, PaginationQuery } from '../../utils/helpers';
import { AuditService } from '../../utils/audit';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

export class ChatService {
  static async createRoom(organizationId: string, data: any, userId: string, req?: Request) {
    const room = await prisma.chatRoom.create({
      data: {
        organizationId,
        type: data.type,
        name: data.name,
        members: {
          create: data.memberIds.map((memberId: string) => ({ userId: memberId })),
        },
        ...(data.patientId && {
          patientChatRooms: {
            create: { patientId: data.patientId },
          },
        }),
      },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
      },
    });

    await AuditService.logCreate(organizationId, userId, 'ChatRoom', room.id, room as any, req);
    return room;
  }

  static async getUserRooms(userId: string) {
    const userRooms = await prisma.userChatRoom.findMany({
      where: { userId },
      include: {
        chatRoom: {
          include: {
            members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, createdAt: true, sender: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
      orderBy: { chatRoom: { updatedAt: 'desc' } },
    });

    return userRooms.map((ur) => ur.chatRoom);
  }

  static async getRoomById(roomId: string, userId: string) {
    const room = await prisma.chatRoom.findFirst({
      where: { id: roomId },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } } },
        patientChatRooms: { include: { patient: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });

    if (!room) throw ApiError.notFound('Chat room not found');

    const isMember = room.members.some((m) => m.userId === userId);
    if (!isMember) throw ApiError.forbidden('You are not a member of this chat room');

    return room;
  }

  static async sendMessage(roomId: string, userId: string, data: any, organizationId: string, req?: Request) {
    const room = await prisma.chatRoom.findFirst({ where: { id: roomId } });
    if (!room) throw ApiError.notFound('Chat room not found');

    const isMember = await prisma.userChatRoom.findFirst({ where: { chatRoomId: roomId, userId } });
    if (!isMember) throw ApiError.forbidden('You are not a member of this chat room');

    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId: roomId,
        senderId: userId,
        content: data.content,
        type: data.type,
        fileUrl: data.fileUrl,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });
    await AuditService.logCreate(organizationId, userId, 'ChatMessage', message.id, message as any, req);
    return message;
  }

  static async getMessages(roomId: string, userId: string, query: PaginationQuery & Record<string, any>) {
    const { page, limit, skip } = getPagination(query);

    const isMember = await prisma.userChatRoom.findFirst({ where: { chatRoomId: roomId, userId } });
    if (!isMember) throw ApiError.forbidden('You are not a member of this chat room');

    const where: Prisma.ChatMessageWhereInput = {
      chatRoomId: roomId,
      isDeleted: false,
      ...(query.before && { createdAt: { lt: new Date(query.before as string) } }),
    };

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      }),
      prisma.chatMessage.count({ where }),
    ]);

    return { messages, total, page, limit };
  }
}
