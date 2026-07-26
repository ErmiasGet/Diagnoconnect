import { Request, Response } from 'express';
import { VisitService } from './visit.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class VisitController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const visit = await VisitService.create(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, visit, 'Visit created successfully');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { visits, total, page, limit } = await VisitService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, visits, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const visit = await VisitService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, visit);
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const visit = await VisitService.updateStatus(req.user!.organizationId!, req.params.id, req.body.status, req.user!.id, req);
    ApiResponse.success(res, visit, 'Visit status updated');
  });

  static getTodayVisits = asyncHandler(async (req: Request, res: Response) => {
    const visits = await VisitService.getTodayVisits(req.user!.organizationId!, req.query.doctorId as string);
    ApiResponse.success(res, visits);
  });
}
