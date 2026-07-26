import { Router } from 'express';
import { RoomController } from './room.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createRoomSchema, updateRoomSchema } from './room.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'));

router.post('/', validate(createRoomSchema), RoomController.create);
router.get('/', RoomController.getAll);
router.get('/:id', RoomController.getById);
router.patch('/:id', validate(updateRoomSchema), RoomController.update);
router.delete('/:id', RoomController.delete);

export default router;
