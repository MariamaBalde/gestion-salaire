import { type Entreprise } from "@prisma/client";
export declare class EntrepriseRepository {
    create(data: Omit<Entreprise, "id" | "createdAt" | "updatedAt">): Promise<Entreprise>;
    findById(id: number): Promise<Entreprise | null>;
    findAll(filters?: {
        nom?: string;
        createdById?: number;
        id?: number;
    }): Promise<Entreprise[]>;
    update(id: number, data: Partial<Omit<Entreprise, "id" | "createdAt" | "updatedAt">>): Promise<Entreprise>;
    delete(id: number): Promise<Entreprise>;
}
//# sourceMappingURL=EntrepriseRepository.d.ts.map