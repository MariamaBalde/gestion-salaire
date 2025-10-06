import { PrismaClient, type PayRun } from "@prisma/client";

export class PayRunRepository {
  private getPrismaClient() {
    return new PrismaClient();
  }

  // 🔹 Création d’un cycle de paie
  async create(
    data: Omit<PayRun, "id" | "createdAt" | "updatedAt">
  ): Promise<PayRun> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payRun.create({ data });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche par ID
  async findById(id: number): Promise<PayRun | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payRun.findUnique({
        where: { id },
        include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche avec filtres
  async findAll(filters?: {
    entrepriseId?: number;
    status?: string;
    createdById?: number;
  }): Promise<PayRun[]> {
    const prismaClient = this.getPrismaClient();
    try {
      const where: any = {};

      if (filters?.entrepriseId) {
        where.entrepriseId = filters.entrepriseId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.createdById) {
        where.createdById = filters.createdById;
      }

      return await prismaClient.payRun.findMany({
        where,
        include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true },
        orderBy: { createdAt: "desc" }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Mise à jour d’un cycle de paie
  async update(
    id: number,
    data: Partial<Omit<PayRun, "id" | "createdAt" | "updatedAt">>
  ): Promise<PayRun> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payRun.update({
        where: { id },
        data,
        include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Suppression
  async delete(id: number): Promise<PayRun> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payRun.delete({
        where: { id }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }
}