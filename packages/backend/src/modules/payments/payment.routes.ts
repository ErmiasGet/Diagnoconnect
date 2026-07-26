import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { processPaymentSchema, verifyPaymentSchema } from './payment.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'CASHIER', 'RECEPTIONIST'));

router.post('/process', validate(processPaymentSchema), PaymentController.processPayment);
router.post('/verify', validate(verifyPaymentSchema), PaymentController.verifyPayment);
router.get('/', PaymentController.getPaymentHistory);
router.get('/:id', PaymentController.getPaymentById);

export default router;
