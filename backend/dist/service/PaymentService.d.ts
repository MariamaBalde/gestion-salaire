import type { Payment } from "@prisma/client";
export declare class PaymentService {
    private paymentRepository;
    create(data: Omit<Payment, "id" | "createdAt" | "updatedAt" | "createdById">, createdById?: number): Promise<{
        payment: Payment;
        payslip: any;
    }>;
    findById(id: number): Promise<Payment | null>;
    findAll(filters?: {
        payslipId?: number;
        createdById?: number;
        entrepriseId?: number;
    }): Promise<Payment[]>;
    update(id: number, data: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>): Promise<Payment>;
    delete(id: number): Promise<Payment>;
    private updatePayslipStatus;
}
//# sourceMappingURL=PaymentService.d.ts.map