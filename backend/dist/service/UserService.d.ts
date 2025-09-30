import type { Utilisateur } from "@prisma/client";
export declare class UserService {
    private userRepository;
    findAll(): Promise<Utilisateur[]>;
    findByEntreprise(entrepriseId: number): Promise<Utilisateur[]>;
    create(data: {
        nom: string;
        email: string;
        motDePasse: string;
        role: string;
        entrepriseId?: number;
    }): Promise<Utilisateur>;
    update(id: number, data: Partial<Utilisateur>): Promise<Utilisateur>;
    delete(id: number): Promise<Utilisateur>;
}
//# sourceMappingURL=UserService.d.ts.map