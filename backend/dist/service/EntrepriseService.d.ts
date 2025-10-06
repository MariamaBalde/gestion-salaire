import type { Entreprise } from "@prisma/client";
export declare class EntrepriseService {
    private entrepriseRepository;
    create(data: Omit<Entreprise, "id" | "createdAt" | "updatedAt" | "createdById" | "logo">, createdById?: number): Promise<Entreprise>;
    findById(id: number): Promise<Entreprise | null>;
    findAll(filters?: {
        nom?: string;
        createdById?: number;
        id?: number;
    }): Promise<Entreprise[]>;
    update(id: number, data: Partial<Omit<Entreprise, "id" | "createdAt" | "updatedAt">>): Promise<Entreprise>;
    delete(id: number): Promise<Entreprise>;
}
//# sourceMappingURL=EntrepriseService.d.ts.map