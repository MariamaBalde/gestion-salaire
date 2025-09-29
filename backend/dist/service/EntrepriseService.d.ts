import type { Entreprise } from "@prisma/client";
export declare class EntrepriseService {
    private entrepriseRepository;
    create(data: {
        nom: string;
        logo?: string;
        adresse: string;
        devise?: string;
        typePeriode?: string;
    }): Promise<Entreprise>;
    findById(id: number): Promise<Entreprise | null>;
    findAll(): Promise<Entreprise[]>;
}
//# sourceMappingURL=EntrepriseService.d.ts.map