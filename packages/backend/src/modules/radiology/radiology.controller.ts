import { Request, Response } from 'express';
import { RadiologyService } from './radiology.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class RadiologyController {
  static createRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await RadiologyService.createRequest(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, request, 'Radiology request created');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { requests, total, page, limit } = await RadiologyService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, requests, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const request = await RadiologyService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, request);
  });

  static getPendingRequests = asyncHandler(async (req: Request, res: Response) => {
    const { requests, total, page, limit } = await RadiologyService.getPendingRequests(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, requests, total, page, limit);
  });

  static uploadImage = asyncHandler(async (req: Request, res: Response) => {
    const image = await RadiologyService.uploadImage(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, image, 'Image uploaded');
  });

  static createReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await RadiologyService.createReport(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, report, 'Report created');
  });

  static approveReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await RadiologyService.approveReport(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.success(res, report, 'Report approved');
  });
}
