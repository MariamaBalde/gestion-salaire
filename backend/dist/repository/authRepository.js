import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class AuthRepository {
    async login(email, motDePasse) {
        return prismaClient.utilisateur.findUnique({
            where: { email },
            include: { entreprise: true }
        });
    }
    async register(nom, email, motDePasse, nomEntreprise, adresseEntreprise) {
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
}
//# sourceMappingURL=authRepository.js.map