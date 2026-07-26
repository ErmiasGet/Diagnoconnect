import { Router } from 'express';
import { DoctorController } from './doctor.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { updateDoctorSchema, updateDoctorScheduleSchema } from './doctor.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'));

router.get('/', DoctorController.getAll);
router.get('/:id', DoctorController.getById);
router.patch('/:id', validate(updateDoctorSchema), DoctorController.update);
router.get('/:id/schedule', DoctorController.getSchedule);
router.put('/:id/schedule', validate(updateDoctorScheduleSchema), DoctorController.updateSchedule);
router.get('/:id/todays-patients', DoctorController.getTodaysPatients);
router.get('/:id/availability', DoctorController.getAvailability);

export default router;
