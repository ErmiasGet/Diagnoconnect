import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { generateReportSchema } from './report.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'CASHIER', 'INSURANCE_OFFICER'));

router.get('/dashboard', ReportController.getDashboardStats);
router.get('/revenue', ReportController.getRevenueReport);
router.get('/patients', ReportController.getPatientReport);
router.get('/appointments', ReportController.getAppointmentReport);
router.get('/lab', ReportController.getLabReport);
router.post('/generate', validate(generateReportSchema), ReportController.generateReport);
router.get('/generated', ReportController.getGeneratedReports);

export default router;
