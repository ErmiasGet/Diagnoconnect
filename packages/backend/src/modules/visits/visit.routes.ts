import { Router } from 'express';
import { VisitController } from './visit.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'CASHIER'));

router.get('/today', VisitController.getTodayVisits);
router.post('/', VisitController.create);
router.get('/', VisitController.getAll);
router.get('/:id', VisitController.getById);
router.patch('/:id/status', VisitController.updateStatus);

export default router;
