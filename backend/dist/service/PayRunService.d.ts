import type { PayRun } from "@prisma/client";
export declare class PayRunService {
    private payRunRepository;
    private employeeRepository;
    create(data: Omit<PayRun, "id" | "createdAt" | "updatedAt" | "createdById">, createdById?: number): Promise<PayRun>;
    findById(id: number): Promise<PayRun | null>;
    findAll(filters?: {
        entrepriseId?: number;
        status?: string;
        createdById?: number;
    }): Promise<PayRun[]>;
    update(id: number, data: Partial<Omit<PayRun, "id" | "createdAt" | "updatedAt">>): Promise<PayRun>;
    delete(id: number): Promise<PayRun>;
    private generatePayslips;
}
//# sourceMappingURL=PayRunService.d.ts.map