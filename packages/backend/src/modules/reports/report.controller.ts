import { Request, Response } from 'express';
import { ReportService } from './report.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class ReportController {
  static getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ReportService.getDashboardStats(req.user!.organizationId!);
    ApiResponse.success(res, stats);
  });

  static getRevenueReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await ReportService.getRevenueReport(req.user!.organizationId!, req.query.dateFrom as string, req.query.dateTo as string);
    ApiResponse.success(res, report);
  });

  static getPatientReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await ReportService.getPatientReport(req.user!.organizationId!, req.query.dateFrom as string, req.query.dateTo as string);
    ApiResponse.success(res, report);
  });

  static getAppointmentReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await ReportService.getAppointmentReport(req.user!.organizationId!, req.query.dateFrom as string, req.query.dateTo as string);
    ApiResponse.success(res, report);
  });

  static getLabReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await ReportService.getLabReport(req.user!.organizationId!, req.query.dateFrom as string, req.query.dateTo as string);
    ApiResponse.success(res, report);
  });

  static generateReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await ReportService.generateReport(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, report, 'Report generated');
  });

  static getGeneratedReports = asyncHandler(async (req: Request, res: Response) => {
    const { reports, total, page, limit } = await ReportService.getGeneratedReports(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, reports, total, page, limit);
  });
}
