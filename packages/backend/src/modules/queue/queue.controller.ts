import { Request, Response } from 'express';
import { QueueService } from './queue.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class QueueController {
  static createEntry = asyncHandler(async (req: Request, res: Response) => {
    const entry = await QueueService.createEntry(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, entry, 'Added to queue');
  });

  static getCurrentQueue = asyncHandler(async (req: Request, res: Response) => {
    const queue = await QueueService.getCurrentQueue(req.user!.organizationId!, req.query.queueType as string, req.query.status as string);
    ApiResponse.success(res, queue);
  });

  static callNext = asyncHandler(async (req: Request, res: Response) => {
    const entry = await QueueService.callNext(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.success(res, entry, 'Next patient called');
  });

  static startService = asyncHandler(async (req: Request, res: Response) => {
    const entry = await QueueService.startService(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.success(res, entry, 'Service started');
  });

  static completeEntry = asyncHandler(async (req: Request, res: Response) => {
    const entry = await QueueService.completeEntry(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.success(res, entry, 'Queue entry completed');
  });

  static skipEntry = asyncHandler(async (req: Request, res: Response) => {
    const entry = await QueueService.skipEntry(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.success(res, entry, 'Queue entry skipped');
  });

  static getQueueStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await QueueService.getQueueStats(req.user!.organizationId!, req.query.queueType as string);
    ApiResponse.success(res, stats);
  });

  static getRealtimeQueue = asyncHandler(async (req: Request, res: Response) => {
    const data = await QueueService.getRealtimeQueue(req.user!.organizationId!, req.query.queueType as string);
    ApiResponse.success(res, data);
  });
}
