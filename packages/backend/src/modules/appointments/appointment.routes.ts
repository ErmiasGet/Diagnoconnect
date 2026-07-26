import { Router } from 'express';
import { AppointmentController } from './appointment.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createAppointmentSchema, updateAppointmentSchema, cancelAppointmentSchema, rescheduleAppointmentSchema } from './appointment.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'));

router.get('/today', AppointmentController.getTodaysAppointments);
router.get('/availability', AppointmentController.getAvailability);
router.get('/doctor/:doctorId', AppointmentController.getByDoctor);
router.get('/patient/:patientId', AppointmentController.getByPatient);
router.post('/', validate(createAppointmentSchema), AppointmentController.create);
router.get('/', AppointmentController.getAll);
router.get('/:id', AppointmentController.getById);
router.patch('/:id', validate(updateAppointmentSchema), AppointmentController.update);
router.post('/:id/cancel', validate(cancelAppointmentSchema), AppointmentController.cancel);
router.post('/:id/reschedule', validate(rescheduleAppointmentSchema), AppointmentController.reschedule);
router.post('/:id/check-in', AppointmentController.checkIn);

export default router;
