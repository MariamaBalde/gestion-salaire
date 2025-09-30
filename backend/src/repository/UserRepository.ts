import { PrismaClient, type $Enums, type Utilisateur } from "@prisma/client";
import type { IRepository } from "./IRepository.js";

const prismaClient = new PrismaClient();
export class UserRepository implements IRepository<Utilisateur> {
  findAll(): Promise<Utilisateur[]> {
    return prismaClient.utilisateur.findMany();
  }
  create(data: Omit<Utilisateur, "id">): Promise<Utilisateur> {
    return prismaClient.utilisateur.create({ data });
  }

  findByEmail(email: string): Promise<Utilisateur | null> {
    return prismaClient.utilisateur.findUnique({
      where: { email },
    });
  }

  findByEntreprise(entrepriseId: number): Promise<Utilisateur[]> {
    return prismaClient.utilisateur.findMany({
      where: { entrepriseId },
    });
  }

  findById(id: number): Promise<Utilisateur | null> {
    return prismaClient.utilisateur.findUnique({
      where: { id },
      include: { entreprise: true }
    });
  }

  update(id: number, data: Partial<Utilisateur>): Promise<Utilisateur> {
    return prismaClient.utilisateur.update({
      where: { id },
      data,
    });
  }

  delete(id: number): Promise<Utilisateur> {
    return prismaClient.utilisateur.delete({
      where: { id },
    });
  }
}