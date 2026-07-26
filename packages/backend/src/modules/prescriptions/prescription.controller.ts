import { Request, Response } from 'express';
import { PrescriptionService } from './prescription.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class PrescriptionController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const prescription = await PrescriptionService.create(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, prescription, 'Prescription created successfully');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { prescriptions, total, page, limit } = await PrescriptionService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, prescriptions, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const prescription = await PrescriptionService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, prescription);
  });

  static getByVisit = asyncHandler(async (req: Request, res: Response) => {
    const prescriptions = await PrescriptionService.getByVisit(req.user!.organizationId!, req.params.visitId);
    ApiResponse.success(res, prescriptions);
  });

  static getByPatient = asyncHandler(async (req: Request, res: Response) => {
    const { prescriptions, total, page, limit } = await PrescriptionService.getByPatient(req.user!.organizationId!, req.params.patientId, req.query as any);
    ApiResponse.paginated(res, prescriptions, total, page, limit);
  });

  static dispense = asyncHandler(async (req: Request, res: Response) => {
    const prescription = await PrescriptionService.dispense(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, prescription, 'Prescription dispensed');
  });

  static cancel = asyncHandler(async (req: Request, res: Response) => {
    const prescription = await PrescriptionService.cancel(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.success(res, prescription, 'Prescription cancelled');
  });
}
