import { PrismaClient, type Entreprise } from "@prisma/client";

const prismaClient = new PrismaClient();

export class EntrepriseRepository {
  // 🔹 Création d’une entreprise
  async create(
    data: Omit<Entreprise, "id" | "createdAt" | "updatedAt">
  ): Promise<Entreprise> {
    return prismaClient.entreprise.create({ data });
  }

  // 🔹 Recherche par ID
  async findById(id: number): Promise<Entreprise | null> {
    return prismaClient.entreprise.findUnique({
      where: { id },
      include: { employes: true, utilisateurs: true }
    });
  }

  // 🔹 Recherche avec filtres
  async findAll(filters?: {
    nom?: string;
    createdById?: number;
    id?: number;
  }): Promise<Entreprise[]> {
    const where: any = {};

    if (filters?.nom) {
      where.nom = { contains: filters.nom };
    }

    if (filters?.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters?.id) {
      where.id = filters.id;
    }

    return prismaClient.entreprise.findMany({
      where,
      include: { employes: true, utilisateurs: true },
      orderBy: { createdAt: "desc" }
    });
  }

  // 🔹 Mise à jour d’une entreprise
  async update(
    id: number,
    data: Partial<Omit<Entreprise, "id" | "createdAt" | "updatedAt">>
  ): Promise<Entreprise> {
    return prismaClient.entreprise.update({
      where: { id },
      data,
      include: { employes: true, utilisateurs: true }
    });
  }

  // 🔹 Suppression
  async delete(id: number): Promise<Entreprise> {
    return prismaClient.entreprise.delete({
      where: { id }
    });
  }
}