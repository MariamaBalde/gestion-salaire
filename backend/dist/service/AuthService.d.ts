export declare class AuthService {
    private authRepository;
    login(email: string, motDePasse: string): Promise<{
        token: string;
        user: {
            motDePasse: undefined;
            id: number;
            nom: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            actif: boolean;
            createdAt: Date;
            entrepriseId: number | null;
            updatedAt: Date;
        };
    }>;
    register(data: {
        nom: string;
        email: string;
        motDePasse: string;
        nomEntreprise: string;
        adresseEntreprise: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            nom: string;
            email: string;
            motDePasse: string;
            role: import("@prisma/client").$Enums.Role;
            actif: boolean;
            createdAt: Date;
            entrepriseId: number | null;
            updatedAt: Date;
        };
    }>;
}
//# sourceMappingURL=AuthService.d.ts.map