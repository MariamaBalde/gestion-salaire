import type { Request, Response } from "express";
export declare class UserController {
    private userService;
    Inscription(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map