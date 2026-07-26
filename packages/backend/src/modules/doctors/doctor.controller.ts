import { Request, Response } from 'express';
import { DoctorService } from './doctor.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class DoctorController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { doctors, total, page, limit } = await DoctorService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, doctors, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await DoctorService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, doctor);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await DoctorService.update(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, doctor, 'Doctor profile updated');
  });

  static getSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await DoctorService.getSchedule(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, schedule);
  });

  static updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await DoctorService.updateSchedule(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, schedule, 'Schedule updated');
  });

  static getTodaysPatients = asyncHandler(async (req: Request, res: Response) => {
    const patients = await DoctorService.getTodaysPatients(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, patients);
  });

  static getAvailability = asyncHandler(async (req: Request, res: Response) => {
    const availability = await DoctorService.getAvailability(req.user!.organizationId!, req.params.id, req.query.date as string);
    ApiResponse.success(res, availability);
  });
}
