import type { Request, Response } from "express";
export declare class PaymentController {
    private paymentService;
    private pdfService;
    create(req: Request, res: Response): Promise<void>;
    findAll(req: Request, res: Response): Promise<void>;
    findById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    generateReceipt(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PaymentController.d.ts.map