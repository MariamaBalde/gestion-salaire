export interface DashboardKPIs {
    masseSalariale: number;
    montantPaye: number;
    montantRestant: number;
    employesActifs: number;
}
export interface PayrollEvolution {
    month: string;
    year: number;
    masseSalariale: number;
}
export interface UpcomingPayment {
    id: number;
    employeeName: string;
    montant: number;
    dateEcheance: Date;
    status: string;
    payslipId: number;
}
export declare class DashboardService {
    getKPIs(entrepriseId: number): Promise<DashboardKPIs>;
    getPayrollEvolution(entrepriseId: number): Promise<PayrollEvolution[]>;
    getUpcomingPayments(entrepriseId: number, limit?: number): Promise<UpcomingPayment[]>;
    getGlobalStats(): Promise<{
        totalEntreprises: number;
        totalEmployes: number;
        totalMasseSalariale: number;
        totalPaiements: number;
    }>;
}
//# sourceMappingURL=DashboardService.d.ts.map