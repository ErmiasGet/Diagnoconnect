import { Request, Response } from 'express';
import { FileService } from './file.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class FileController {
  static uploadFile = asyncHandler(async (req: Request, res: Response) => {
    const file = await FileService.uploadFile(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, file, 'File uploaded');
  });

  static getFilesByPatient = asyncHandler(async (req: Request, res: Response) => {
    const { files, total, page, limit } = await FileService.getFilesByPatient(req.user!.organizationId!, req.params.patientId, req.query as any);
    ApiResponse.paginated(res, files, total, page, limit);
  });

  static getFileById = asyncHandler(async (req: Request, res: Response) => {
    const file = await FileService.getFileById(req.params.id, req.user!.id);
    ApiResponse.success(res, file);
  });

  static deleteFile = asyncHandler(async (req: Request, res: Response) => {
    await FileService.deleteFile(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.noContent(res);
  });

  static getAllFiles = asyncHandler(async (req: Request, res: Response) => {
    const { files, total, page, limit } = await FileService.getAllFiles(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, files, total, page, limit);
  });
}
