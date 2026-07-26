import { Router } from 'express';
import { PharmacyController } from './pharmacy.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createMedicineSchema, updateMedicineSchema, stockAdjustmentSchema, createSupplierSchema, updateSupplierSchema, createPurchaseOrderSchema } from './pharmacy.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'PHARMACIST', 'DOCTOR', 'NURSE'));

router.get('/low-stock', PharmacyController.getLowStockAlerts);
router.get('/suppliers', PharmacyController.getAllSuppliers);
router.post('/suppliers', validate(createSupplierSchema), PharmacyController.createSupplier);
router.patch('/suppliers/:id', validate(updateSupplierSchema), PharmacyController.updateSupplier);
router.get('/purchase-orders', PharmacyController.getAllPurchaseOrders);
router.post('/purchase-orders', validate(createPurchaseOrderSchema), PharmacyController.createPurchaseOrder);
router.get('/medicines', PharmacyController.getAllMedicines);
router.post('/medicines', validate(createMedicineSchema), PharmacyController.createMedicine);
router.get('/medicines/:id', PharmacyController.getMedicineById);
router.patch('/medicines/:id', validate(updateMedicineSchema), PharmacyController.updateMedicine);
router.post('/stock-adjustment', validate(stockAdjustmentSchema), PharmacyController.adjustStock);

export default router;
