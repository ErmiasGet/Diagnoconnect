import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class SettingsController {
  static getOrgSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.getOrgSettings(req.user!.organizationId!);
    ApiResponse.success(res, settings);
  });

  static updateOrgSettings = asyncHandler(async (req: Request, res: Response) => {
    const organization = await SettingsService.updateOrgSettings(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.success(res, organization, 'Organization settings updated');
  });

  static getAllSettings = asyncHandler(async (req: Request, res: Response) => {
    const { settings, total, page, limit } = await SettingsService.getAllSettings(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, settings, total, page, limit);
  });

  static getSetting = asyncHandler(async (req: Request, res: Response) => {
    const setting = await SettingsService.getSetting(req.user!.organizationId!, req.params.key);
    if (!setting) ApiResponse.success(res, null, 'Setting not found', 404);
    else ApiResponse.success(res, setting);
  });

  static upsertSetting = asyncHandler(async (req: Request, res: Response) => {
    const setting = await SettingsService.upsertSetting(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.success(res, setting, 'Setting updated');
  });

  static bulkUpdateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.bulkUpdateSettings(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.success(res, settings, 'Settings updated');
  });

  static deleteSetting = asyncHandler(async (req: Request, res: Response) => {
    await SettingsService.deleteSetting(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.noContent(res);
  });
}
