import { Router } from 'express';
import { QueueController } from './queue.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createQueueEntrySchema, callNextSchema } from './queue.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'CASHIER'));

router.get('/stats', QueueController.getQueueStats);
router.get('/realtime', QueueController.getRealtimeQueue);
router.get('/', QueueController.getCurrentQueue);
router.post('/', validate(createQueueEntrySchema), QueueController.createEntry);
router.post('/call-next', validate(callNextSchema), QueueController.callNext);
router.post('/:id/start', QueueController.startService);
router.post('/:id/complete', QueueController.completeEntry);
router.post('/:id/skip', QueueController.skipEntry);

export default router;
