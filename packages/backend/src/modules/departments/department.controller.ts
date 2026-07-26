import { Request, Response } from 'express';
import { DepartmentService } from './department.service';
import { ApiResponse, asyncHandler } from '../../utils/helpers';

export class DepartmentController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.create(req.user!.organizationId!, req.body, req.user!.id, req);
    ApiResponse.created(res, department, 'Department created successfully');
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { departments, total, page, limit } = await DepartmentService.getAll(req.user!.organizationId!, req.query as any);
    ApiResponse.paginated(res, departments, total, page, limit);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.getById(req.user!.organizationId!, req.params.id);
    ApiResponse.success(res, department);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.update(req.user!.organizationId!, req.params.id, req.body, req.user!.id, req);
    ApiResponse.success(res, department, 'Department updated');
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await DepartmentService.delete(req.user!.organizationId!, req.params.id, req.user!.id, req);
    ApiResponse.noContent(res);
  });
}
