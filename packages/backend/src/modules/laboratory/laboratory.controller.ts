import { Request, Response } from 'express';
import { LaboratoryService } from './laboratory.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class LaboratoryController {
  static createLaboratory = asyncHandler(async (req: Request, res: Response) => {
    const lab = await LaboratoryService.createLaboratory(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, lab, 'Laboratory created');
  });

  static getAllLaboratories = asyncHandler(async (req: Request, res: Response) => {
    const labs = await LaboratoryService.getAllLaboratories(req.user!.organizationId!);
    ApiResponse.success(res, labs);
  });

  static updateLaboratory = asyncHandler(async (req: Request, res: Response) => {
    const lab = await LaboratoryService.updateLaboratory(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, lab, 'Laboratory updated');
  });

  static createTest = asyncHandler(async (req: Request, res: Response) => {
    const test = await LaboratoryService.createTest(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, test, 'Test created');
  });

  static getAllTests = asyncHandler(async (req: Request, res: Response) => {
    const { tests, total, page, limit } = await LaboratoryService.getAllTests(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, tests, total, page, limit);
  });

  static updateTest = asyncHandler(async (req: Request, res: Response) => {
    const test = await LaboratoryService.updateTest(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, test, 'Test updated');
  });

  static createTestCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await LaboratoryService.createTestCategory(req.user!.organizationId!, req.body);
    ApiResponse.created(res, category, 'Test category created');
  });

  static getAllTestCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await LaboratoryService.getAllTestCategories(req.user!.organizationId!);
    ApiResponse.success(res, categories);
  });

  static createLabRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await LaboratoryService.createLabRequest(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, request, 'Lab request created');
  });

  static getPendingTests = asyncHandler(async (req: Request, res: Response) => {
    const { requests, total, page, limit } = await LaboratoryService.getPendingTests(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, requests, total, page, limit);
  });

  static enterResults = asyncHandler(async (req: Request, res: Response) => {
    const result = await LaboratoryService.enterResults(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.success(res, result, 'Results entered');
  });

  static approveResults = asyncHandler(async (req: Request, res: Response) => {
    const result = await LaboratoryService.approveResults(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.success(res, result, 'Results approved');
  });

  static getLabStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await LaboratoryService.getLabStats(req.user!.organizationId!);
    ApiResponse.success(res, stats);
  });
}
