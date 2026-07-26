import { Request, Response } from 'express';
import { PatientService } from './patient.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class PatientController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.create(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, patient, 'Patient created successfully');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { patients, total, page, limit } = await PatientService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, patients, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, patient);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.update(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, patient, 'Patient updated successfully');
  });

  static getMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
    const history = await PatientService.getMedicalHistory(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, history);
  });

  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await PatientService.getStats(req.user!.organizationId!);
    ApiResponse.success(res, stats);
  });
}
