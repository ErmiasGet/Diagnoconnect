import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class PaymentController {
  static processPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await PaymentService.processPayment(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, payment, 'Payment processed');
  });

  static getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
    const { payments, total, page, limit } = await PaymentService.getPaymentHistory(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, payments, total, page, limit);
  });

  static verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const result = await PaymentService.verifyPayment(req.user!.organizationId!, req.body.transactionId, req.body.gateway, req.user!.id, req);
    ApiResponse.success(res, result, 'Payment verified');
  });

  static getPaymentById = asyncHandler(async (req: Request, res: Response) => {
    const payment = await PaymentService.getPaymentById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, payment);
  });
}
