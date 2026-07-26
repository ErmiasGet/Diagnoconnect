import { Request, Response } from 'express';
import { InsuranceService } from './insurance.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class InsuranceController {
  static createProvider = asyncHandler(async (req: Request, res: Response) => {
    const provider = await InsuranceService.createProvider(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, provider, 'Insurance provider created');
  });

  static getAllProviders = asyncHandler(async (req: Request, res: Response) => {
    const providers = await InsuranceService.getAllProviders(req.user!.organizationId!);
    ApiResponse.success(res, providers);
  });

  static updateProvider = asyncHandler(async (req: Request, res: Response) => {
    const provider = await InsuranceService.updateProvider(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, provider, 'Provider updated');
  });

  static createPolicy = asyncHandler(async (req: Request, res: Response) => {
    const policy = await InsuranceService.createPolicy(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, policy, 'Insurance policy created');
  });

  static getPolicies = asyncHandler(async (req: Request, res: Response) => {
    const { policies, total, page, limit } = await InsuranceService.getPolicies(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, policies, total, page, limit);
  });

  static submitClaim = asyncHandler(async (req: Request, res: Response) => {
    const claim = await InsuranceService.submitClaim(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, claim, 'Claim submitted');
  });

  static getClaims = asyncHandler(async (req: Request, res: Response) => {
    const { claims, total, page, limit } = await InsuranceService.getClaims(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, claims, total, page, limit);
  });

  static reviewClaim = asyncHandler(async (req: Request, res: Response) => {
    const claim = await InsuranceService.reviewClaim(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, claim, 'Claim reviewed');
  });
}
