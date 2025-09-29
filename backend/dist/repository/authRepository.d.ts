import { type Utilisateur } from "@prisma/client";
export declare class AuthRepository {
    login(email: string, motDePasse: string): Promise<Utilisateur | null>;
}
//# sourceMappingURL=authRepository.d.ts.map