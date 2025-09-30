import { type Utilisateur } from "@prisma/client";
export declare class AuthRepository {
    login(email: string, motDePasse: string): Promise<Utilisateur | null>;
    register(nom: string, email: string, motDePasse: string, nomEntreprise: string, adresseEntreprise: string): Promise<Utilisateur>;
}
//# sourceMappingURL=authRepository.d.ts.map