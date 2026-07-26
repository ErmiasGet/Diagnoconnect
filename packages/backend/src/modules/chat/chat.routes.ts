import { Router } from 'express';
import { ChatController } from './chat.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createChatRoomSchema, sendMessageSchema } from './chat.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST'));

router.get('/rooms', ChatController.getUserRooms);
router.post('/rooms', validate(createChatRoomSchema), ChatController.createRoom);
router.get('/rooms/:id', ChatController.getRoomById);
router.get('/rooms/:id/messages', ChatController.getMessages);
router.post('/rooms/:id/messages', validate(sendMessageSchema), ChatController.sendMessage);

export default router;
