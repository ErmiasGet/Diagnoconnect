import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class ChatController {
  static createRoom = asyncHandler(async (req: Request, res: Response) => {
    const room = await ChatService.createRoom(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, room, 'Chat room created');
  });

  static getUserRooms = asyncHandler(async (req: Request, res: Response) => {
    const rooms = await ChatService.getUserRooms(req.user!.id);
    ApiResponse.success(res, rooms);
  });

  static getRoomById = asyncHandler(async (req: Request, res: Response) => {
    const room = await ChatService.getRoomById(req.params.id, req.user!.id);
    ApiResponse.success(res, room);
  });

  static sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const message = await ChatService.sendMessage(req.params.id, req.user!.id, req.body, req.user!.organizationId!, req);
    ApiResponse.created(res, message, 'Message sent');
  });

  static getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { messages, total, page, limit } = await ChatService.getMessages(req.params.id, req.user!.id, req.query as any);
    ApiResponse.paginated(res, messages, total, page, limit);
  });
}
