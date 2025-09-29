import { type Entreprise } from "@prisma/client";
export declare class EntrepriseRepository {
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
//# sourceMappingURL=EntrepriseRepository.d.ts.map