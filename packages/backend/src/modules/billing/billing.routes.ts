import { Router } from 'express';
import { BillingController } from './billing.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createInvoiceSchema, processPaymentSchema, createRefundSchema } from './billing.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'CASHIER', 'RECEPTIONIST', 'DOCTOR', 'PHARMACIST'));

router.get('/reports', BillingController.getFinancialReports);
router.post('/invoices', validate(createInvoiceSchema), BillingController.createInvoice);
router.get('/invoices', BillingController.getAll);
router.get('/invoices/:id', BillingController.getById);
router.post('/invoices/:id/payments', validate(processPaymentSchema), BillingController.processPayment);
router.post('/invoices/:id/refunds', validate(createRefundSchema), BillingController.createRefund);

export default router;
