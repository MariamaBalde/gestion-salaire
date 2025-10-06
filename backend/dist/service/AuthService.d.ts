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
}
//# sourceMappingURL=AuthService.d.ts.map