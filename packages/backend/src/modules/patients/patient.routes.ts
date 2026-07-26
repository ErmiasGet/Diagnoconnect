import { Router } from 'express';
import { PatientController } from './patient.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createPatientSchema, updatePatientSchema } from './patient.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'));

router.get('/stats', PatientController.getStats);
router.post('/', validate(createPatientSchema), PatientController.create);
router.get('/', PatientController.getAll);
router.get('/:id', PatientController.getById);
router.patch('/:id', validate(updatePatientSchema), PatientController.update);
router.get('/:id/medical-history', PatientController.getMedicalHistory);

export default router;
