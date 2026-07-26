import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { updateOrgSettingsSchema, upsertSettingSchema, bulkUpdateSettingsSchema } from './settings.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN'));

router.get('/org', SettingsController.getOrgSettings);
router.patch('/org', validate(updateOrgSettingsSchema), SettingsController.updateOrgSettings);
router.get('/', SettingsController.getAllSettings);
router.get('/:key', SettingsController.getSetting);
router.post('/', validate(upsertSettingSchema), SettingsController.upsertSetting);
router.post('/bulk', validate(bulkUpdateSettingsSchema), SettingsController.bulkUpdateSettings);
router.delete('/:id', SettingsController.deleteSetting);

export default router;
