import type { Utilisateur } from "@prisma/client";
export declare class UserService {
    private userRepository;
    findAll(): Promise<Utilisateur[]>;
    create(data: {
        nom: string;
        email: string;
        motDePasse: string;
        role: string;
        entrepriseId?: number;
    }): Promise<Utilisateur>;
}
//# sourceMappingURL=UserService.d.ts.map