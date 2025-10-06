import { PrismaClient, type Entreprise } from "@prisma/client";

export class EntrepriseRepository {
  private prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();
  }

  // 🔹 Création d’une entreprise
  async create(
    data: Omit<Entreprise, "id" | "createdAt" | "updatedAt">
  ): Promise<Entreprise> {
    try {
      return await this.prismaClient.entreprise.create({
        data,
        include: { employes: true, utilisateurs: true }
      });
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche par ID
  async findById(id: number): Promise<Entreprise | null> {
    try {
      return await this.prismaClient.entreprise.findUnique({
        where: { id },
        include: { employes: true, utilisateurs: true }
      });
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche avec filtres
  async findAll(filters?: {
    nom?: string;
    createdById?: number;
    id?: number;
  }): Promise<Entreprise[]> {
    try {
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

      return await this.prismaClient.entreprise.findMany({
        where,
        include: { employes: true, utilisateurs: true },
        orderBy: { createdAt: "desc" }
      });
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  // 🔹 Mise à jour d’une entreprise
  async update(
    id: number,
    data: Partial<Omit<Entreprise, "id" | "createdAt" | "updatedAt">>
  ): Promise<Entreprise> {
    try {
      return await this.prismaClient.entreprise.update({
        where: { id },
        data,
        include: { employes: true, utilisateurs: true }
      });
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  // 🔹 Suppression
  async delete(id: number): Promise<Entreprise> {
    try {
      return await this.prismaClient.entreprise.delete({
        where: { id }
      });
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}