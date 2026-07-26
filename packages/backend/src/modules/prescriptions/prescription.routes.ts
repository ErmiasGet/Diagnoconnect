import { Router } from 'express';
import { PrescriptionController } from './prescription.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createPrescriptionSchema, dispensePrescriptionSchema } from './prescription.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST'));

router.post('/', validate(createPrescriptionSchema), PrescriptionController.create);
router.get('/', PrescriptionController.getAll);
router.get('/:id', PrescriptionController.getById);
router.get('/visit/:visitId', PrescriptionController.getByVisit);
router.get('/patient/:patientId', PrescriptionController.getByPatient);
router.post('/:id/dispense', validate(dispensePrescriptionSchema), PrescriptionController.dispense);
router.post('/:id/cancel', PrescriptionController.cancel);

export default router;
