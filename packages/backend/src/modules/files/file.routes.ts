import { Router } from 'express';
import { FileController } from './file.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { uploadFileSchema } from './file.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST'));

router.post('/', validate(uploadFileSchema), FileController.uploadFile);
router.get('/', FileController.getAllFiles);
router.get('/patient/:patientId', FileController.getFilesByPatient);
router.get('/:id', FileController.getFileById);
router.delete('/:id', FileController.deleteFile);

export default router;
