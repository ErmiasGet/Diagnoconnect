import { Request, Response } from 'express';
import { EmrService } from './emr.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class EmrController {
  static createMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
    const record = await EmrService.createMedicalRecord(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, record, 'Medical record created');
  });

  static getMedicalRecords = asyncHandler(async (req: Request, res: Response) => {
    const { records, total, page, limit } = await EmrService.getMedicalRecords(req.user!.organizationId!, req.params.patientId, req.query as any);
    ApiResponse.paginated(res, records, total, page, limit);
  });

  static getMedicalRecordById = asyncHandler(async (req: Request, res: Response) => {
    const record = await EmrService.getMedicalRecordById(req.params.id);
    ApiResponse.success(res, record);
  });

  static createSOAPNote = asyncHandler(async (req: Request, res: Response) => {
    const note = await EmrService.createSOAPNote(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, note, 'SOAP note created');
  });

  static getSOAPNotes = asyncHandler(async (req: Request, res: Response) => {
    const notes = await EmrService.getSOAPNotes(req.user!.organizationId!, req.params.patientId, req.query.visitId as string);
    ApiResponse.success(res, notes);
  });

  static recordVitals = asyncHandler(async (req: Request, res: Response) => {
    const vitals = await EmrService.recordVitals(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, vitals, 'Vitals recorded');
  });

  static getVitalsHistory = asyncHandler(async (req: Request, res: Response) => {
    const vitals = await EmrService.getVitalsHistory(req.params.patientId, parseInt(req.query.limit as string) || 50);
    ApiResponse.success(res, vitals);
  });

  static createClinicalDecisionSupport = asyncHandler(async (req: Request, res: Response) => {
    const cds = await EmrService.createClinicalDecisionSupport(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, cds, 'Clinical decision support created');
  });

  static getClinicalDecisionSupports = asyncHandler(async (req: Request, res: Response) => {
    const cds = await EmrService.getClinicalDecisionSupports(req.user!.organizationId!, req.params.patientId);
    ApiResponse.success(res, cds);
  });
}
