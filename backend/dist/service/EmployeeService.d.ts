import type { Employe } from "@prisma/client";
export declare class EmployeeService {
    private employeeRepository;
    create(data: {
        nomComplet: string;
        poste: string;
        typeContrat: string;
        tauxSalaire: number;
        coordonneesBancaires?: string;
        entrepriseId: number;
    }): Promise<Employe>;
    findById(id: number): Promise<Employe | null>;
    findAll(filters?: {
        actif?: boolean;
        poste?: string;
        typeContrat?: string;
        entrepriseId?: number;
    }): Promise<Employe[]>;
    update(id: number, data: {
        nomComplet?: string;
        poste?: string;
        typeContrat?: string;
        tauxSalaire?: number;
        coordonneesBancaires?: string;
    }): Promise<Employe>;
    delete(id: number): Promise<Employe>;
    toggleActive(id: number): Promise<Employe>;
}
//# sourceMappingURL=EmployeeService.d.ts.map