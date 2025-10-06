import type { Request, Response } from "express";
export declare class DashboardController {
    private dashboardService;
    getKPIs(req: Request, res: Response): Promise<void>;
    getPayrollEvolution(req: Request, res: Response): Promise<void>;
    getUpcomingPayments(req: Request, res: Response): Promise<void>;
    getGlobalStats(req: Request, res: Response): Promise<void>;
    getDashboardData(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=DashboardController.d.ts.map