import { PrismaClient, type Utilisateur } from "@prisma/client";

const prismaClient = new PrismaClient();

export class AuthRepository {
  async login(email: string, motDePasse: string): Promise<Utilisateur | null> {
    return prismaClient.utilisateur.findUnique(
        {
           where: { email}
        }
    );
  }
}
