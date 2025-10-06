import { PrismaClient, type Utilisateur } from "@prisma/client";
import bcrypt from "bcryptjs";

export class AuthRepository {
  private getPrismaClient() {
    return new PrismaClient();
  }

  async login(email: string, motDePasse: string): Promise<Utilisateur | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.findUnique({
        where: { email },
        include: { entreprise: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async register(nom: string, email: string, motDePasse: string, nomEntreprise: string, adresseEntreprise: string, role: string = 'SUPER_ADMIN'): Promise<Utilisateur> {
    const prismaClient = this.getPrismaClient();
    try {
      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      const user = await prismaClient.utilisateur.create({
        data: {
          nom,
          email,
          motDePasse: hashedPassword,
          role: role as any,
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
    } finally {
      await prismaClient.$disconnect();
    }
  }
}
