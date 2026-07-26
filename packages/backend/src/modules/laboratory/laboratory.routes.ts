import { Router } from 'express';
import { LaboratoryController } from './laboratory.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createLaboratorySchema, createTestSchema, createLabRequestSchema, enterResultsSchema, createTestCategorySchema } from './laboratory.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'NURSE', 'RECEPTIONIST'));

router.get('/stats', LaboratoryController.getLabStats);
router.get('/pending', LaboratoryController.getPendingTests);
router.post('/requests', validate(createLabRequestSchema), LaboratoryController.createLabRequest);
router.post('/results/enter', validate(enterResultsSchema), LaboratoryController.enterResults);
router.post('/results/:id/approve', LaboratoryController.approveResults);
router.get('/laboratories', LaboratoryController.getAllLaboratories);
router.post('/laboratories', validate(createLaboratorySchema), LaboratoryController.createLaboratory);
router.patch('/laboratories/:id', LaboratoryController.updateLaboratory);
router.get('/categories', LaboratoryController.getAllTestCategories);
router.post('/categories', validate(createTestCategorySchema), LaboratoryController.createTestCategory);
router.get('/tests', LaboratoryController.getAllTests);
router.post('/tests', validate(createTestSchema), LaboratoryController.createTest);
router.patch('/tests/:id', LaboratoryController.updateTest);

export default router;
