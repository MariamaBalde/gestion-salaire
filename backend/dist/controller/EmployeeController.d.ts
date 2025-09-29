import type { Request, Response } from "express";
export declare class EmployeeController {
    private employeeService;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    findAll(req: Request, res: Response): Promise<void>;
    findById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleActive(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=EmployeeController.d.ts.map