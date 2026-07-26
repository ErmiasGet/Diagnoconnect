import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createDepartmentSchema, updateDepartmentSchema } from './department.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'));

router.post('/', validate(createDepartmentSchema), DepartmentController.create);
router.get('/', DepartmentController.getAll);
router.get('/:id', DepartmentController.getById);
router.patch('/:id', validate(updateDepartmentSchema), DepartmentController.update);
router.delete('/:id', DepartmentController.delete);

export default router;
