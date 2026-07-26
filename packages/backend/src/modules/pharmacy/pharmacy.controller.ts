import { Request, Response } from 'express';
import { PharmacyService } from './pharmacy.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class PharmacyController {
  static createMedicine = asyncHandler(async (req: Request, res: Response) => {
    const medicine = await PharmacyService.createMedicine(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, medicine, 'Medicine created');
  });

  static getAllMedicines = asyncHandler(async (req: Request, res: Response) => {
    const { medicines, total, page, limit } = await PharmacyService.getAllMedicines(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, medicines, total, page, limit);
  });

  static getMedicineById = asyncHandler(async (req: Request, res: Response) => {
    const medicine = await PharmacyService.getMedicineById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, medicine);
  });

  static updateMedicine = asyncHandler(async (req: Request, res: Response) => {
    const medicine = await PharmacyService.updateMedicine(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, medicine, 'Medicine updated');
  });

  static adjustStock = asyncHandler(async (req: Request, res: Response) => {
    const medicine = await PharmacyService.adjustStock(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.success(res, medicine, 'Stock adjusted');
  });

  static getLowStockAlerts = asyncHandler(async (req: Request, res: Response) => {
    const alerts = await PharmacyService.getLowStockAlerts(req.user!.organizationId!);
    ApiResponse.success(res, alerts);
  });

  static createSupplier = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await PharmacyService.createSupplier(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, supplier, 'Supplier created');
  });

  static getAllSuppliers = asyncHandler(async (req: Request, res: Response) => {
    const suppliers = await PharmacyService.getAllSuppliers(req.user!.organizationId!);
    ApiResponse.success(res, suppliers);
  });

  static updateSupplier = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await PharmacyService.updateSupplier(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, supplier, 'Supplier updated');
  });

  static createPurchaseOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await PharmacyService.createPurchaseOrder(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, order, 'Purchase order created');
  });

  static getAllPurchaseOrders = asyncHandler(async (req: Request, res: Response) => {
    const { orders, total, page, limit } = await PharmacyService.getAllPurchaseOrders(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, orders, total, page, limit);
  });
}
