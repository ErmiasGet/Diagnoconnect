import { Request, Response } from 'express';
import { RoomService } from './room.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class RoomController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const room = await RoomService.create(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, room, 'Room created successfully');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { rooms, total, page, limit } = await RoomService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, rooms, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const room = await RoomService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, room);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const room = await RoomService.update(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, room, 'Room updated');
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await RoomService.delete(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.noContent(res);
  });
}
