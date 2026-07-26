import { Request, Response } from 'express';
import { AppointmentService } from './appointment.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class AppointmentController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.create(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, appointment, 'Appointment created successfully');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { appointments, total, page, limit } = await AppointmentService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, appointments, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, appointment);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.update(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, appointment, 'Appointment updated successfully');
  });

  static cancel = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.cancel(req.user!.organizationId!, req.params.id, req.body.cancellationReason, req.user!.id, req);
    ApiResponse.success(res, appointment, 'Appointment cancelled');
  });

  static reschedule = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.reschedule(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, appointment, 'Appointment rescheduled');
  });

  static checkIn = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.checkIn(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.success(res, appointment, 'Patient checked in');
  });

  static getAvailability = asyncHandler(async (req: Request, res: Response) => {
    const availability = await AppointmentService.getAvailability(req.user!.organizationId!, req.query.doctorId as string, req.query.date as string);
    ApiResponse.success(res, availability);
  });

  static getTodaysAppointments = asyncHandler(async (req: Request, res: Response) => {
    const appointments = await AppointmentService.getTodaysAppointments(req.user!.organizationId!, req.query.doctorId as string);
    ApiResponse.success(res, appointments);
  });

  static getByDoctor = asyncHandler(async (req: Request, res: Response) => {
    const appointments = await AppointmentService.getByDoctor(req.user!.organizationId!, req.params.doctorId, req.query.date as string);
    ApiResponse.success(res, appointments);
  });

  static getByPatient = asyncHandler(async (req: Request, res: Response) => {
    const { appointments, total, page, limit } = await AppointmentService.getByPatient(req.user!.organizationId!, req.params.patientId, req.query as any);
    ApiResponse.paginated(res, appointments, total, page, limit);
  });
}
