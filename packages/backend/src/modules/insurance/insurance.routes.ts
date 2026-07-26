import { Router } from 'express';
import { InsuranceController } from './insurance.controller';
import { authenticate, authorizeOrganization } from '../../middleware/auth';
import { validate } from '../../utils/helpers';
import { createInsuranceProviderSchema, updateInsuranceProviderSchema, createInsurancePolicySchema, createClaimSchema, reviewClaimSchema } from './insurance.validation';

const router = Router();

router.use(authenticate);
router.use(authorizeOrganization('SUPER_ADMIN', 'ORG_ADMIN', 'INSURANCE_OFFICER', 'RECEPTIONIST', 'CASHIER'));

router.get('/providers', InsuranceController.getAllProviders);
router.post('/providers', validate(createInsuranceProviderSchema), InsuranceController.createProvider);
router.patch('/providers/:id', validate(updateInsuranceProviderSchema), InsuranceController.updateProvider);
router.get('/policies', InsuranceController.getPolicies);
router.post('/policies', validate(createInsurancePolicySchema), InsuranceController.createPolicy);
router.get('/claims', InsuranceController.getClaims);
router.post('/claims', validate(createClaimSchema), InsuranceController.submitClaim);
router.patch('/claims/:id/review', validate(reviewClaimSchema), InsuranceController.reviewClaim);

export default router;
