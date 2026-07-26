import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class BillingController {
  static createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await BillingService.createInvoice(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, invoice, 'Invoice created');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { invoices, total, page, limit } = await BillingService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, invoices, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await BillingService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, invoice);
  });

  static processPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await BillingService.processPayment(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.created(res, payment, 'Payment processed');
  });

  static createRefund = asyncHandler(async (req: Request, res: Response) => {
    const refund = await BillingService.createRefund(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.created(res, refund, 'Refund initiated');
  });

  static getFinancialReports = asyncHandler(async (req: Request, res: Response) => {
    const reports = await BillingService.getFinancialReports(req.user!.organizationId!, req.query.dateFrom as string, req.query.dateTo as string);
    ApiResponse.success(res, reports);
  });
}
