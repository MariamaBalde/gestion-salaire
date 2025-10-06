import { PrismaClient } from "@prisma/client";
export class AuthRepository {
    getPrismaClient() {
        return new PrismaClient();
    }
    async login(email, motDePasse) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.findUnique({
                where: { email },
                include: { entreprise: true }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    async register(nom, email, motDePasse, nomEntreprise, adresseEntreprise) {
        const prismaClient = this.getPrismaClient();
        try {
            const user = await prismaClient.utilisateur.create({
                data: {
                    nom,
                    email,
                    motDePasse,
                    role: 'SUPER_ADMIN',
                }
            });
            const entreprise = await prismaClient.entreprise.create({
                data: {
                    nom: nomEntreprise,
                    adresse: adresseEntreprise,
                    createdById: user.id,
                }
            });
            // Update user with entrepriseId
            const updatedUser = await prismaClient.utilisateur.update({
                where: { id: user.id },
                data: { entrepriseId: entreprise.id },
                include: { entreprise: true }
            });
            return updatedUser;
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
}
//# sourceMappingURL=authRepository.js.map