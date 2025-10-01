import { type Payment } from "@prisma/client";
export declare class PaymentRepository {
    create(data: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment>;
    findById(id: number): Promise<Payment | null>;
    findAll(filters?: {
        payslipId?: number;
        createdById?: number;
        entrepriseId?: number;
    }): Promise<Payment[]>;
    update(id: number, data: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>): Promise<Payment>;
    delete(id: number): Promise<Payment>;
}
//# sourceMappingURL=PaymentRepository.d.ts.map