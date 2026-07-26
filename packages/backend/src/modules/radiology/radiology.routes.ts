import { Router } from 'express';
import { RadiologyController } from './radiology.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createRadiologyRequestSchema, createRadiologyReportSchema, uploadImageSchema } from './radiology.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'DOCTOR', 'RADIOLOGIST', 'NURSE', 'RECEPTIONIST'));

router.get('/pending', RadiologyController.getPendingRequests);
router.post('/requests', validate(createRadiologyRequestSchema), RadiologyController.createRequest);
router.post('/images', validate(uploadImageSchema), RadiologyController.uploadImage);
router.post('/reports', validate(createRadiologyReportSchema), RadiologyController.createReport);
router.post('/reports/:id/approve', RadiologyController.approveReport);
router.get('/', RadiologyController.getAll);
router.get('/:id', RadiologyController.getById);

export default router;
