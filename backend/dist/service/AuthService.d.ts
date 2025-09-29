export declare class AuthService {
    private authRepository;
    login(email: string, motDePasse: string): Promise<{
        token: string;
        user: {
            id: number;
            nom: string;
            email: string;
            motDePasse: string;
            role: import("@prisma/client").$Enums.Role;
            actif: boolean;
            entrepriseId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
//# sourceMappingURL=AuthService.d.ts.map