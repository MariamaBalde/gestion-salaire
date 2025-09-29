import { type Employe } from "@prisma/client";
export declare class EmployeeRepository {
    create(data: Omit<Employe, "id" | "createdAt" | "updatedAt">): Promise<Employe>;
    findById(id: number): Promise<Employe | null>;
    findAll(filters?: {
        actif?: boolean;
        poste?: string;
        typeContrat?: string;
        entrepriseId?: number;
    }): Promise<Employe[]>;
    update(id: number, data: Partial<Omit<Employe, "id" | "createdAt" | "updatedAt">>): Promise<Employe>;
    delete(id: number): Promise<Employe>;
    toggleActive(id: number): Promise<Employe>;
}
//# sourceMappingURL=EmployeeRepository.d.ts.map