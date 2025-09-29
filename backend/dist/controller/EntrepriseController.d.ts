import type { Request, Response } from "express";
export declare class EntrepriseController {
    private entrepriseService;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    findAll(req: Request, res: Response): Promise<void>;
    findById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=EntrepriseController.d.ts.map