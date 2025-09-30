import { PrismaClient, type Utilisateur } from "@prisma/client";

const prismaClient = new PrismaClient();

export class AuthRepository {
  async login(email: string, motDePasse: string): Promise<Utilisateur | null> {
    return prismaClient.utilisateur.findUnique(
        {
           where: { email },
           include: { entreprise: true }
        }
    );
  }

  async register(nom: string, email: string, motDePasse: string, nomEntreprise: string, adresseEntreprise: string): Promise<Utilisateur> {
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
