import type { Request, Response } from "express";
export declare class EmployeeController {
    create(req: Request, res: Response): Promise<void>;
    findAll(req: Request, res: Response): Promise<void>;
    findById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    toggleActive(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=EmployeeController.d.ts.map