import { Router } from 'express';
import { EmrController } from './emr.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createMedicalRecordSchema, createSOAPNoteSchema, recordVitalsSchema, clinicalDecisionSupportSchema } from './emr.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN'));

router.post('/records', validate(createMedicalRecordSchema), EmrController.createMedicalRecord);
router.get('/records/patient/:patientId', EmrController.getMedicalRecords);
router.get('/records/:id', EmrController.getMedicalRecordById);
router.post('/soap-notes', validate(createSOAPNoteSchema), EmrController.createSOAPNote);
router.get('/soap-notes/patient/:patientId', EmrController.getSOAPNotes);
router.post('/vitals', validate(recordVitalsSchema), EmrController.recordVitals);
router.get('/vitals/patient/:patientId', EmrController.getVitalsHistory);
router.post('/clinical-decision-support', validate(clinicalDecisionSupportSchema), EmrController.createClinicalDecisionSupport);
router.get('/clinical-decision-support/patient/:patientId', EmrController.getClinicalDecisionSupports);

export default router;
