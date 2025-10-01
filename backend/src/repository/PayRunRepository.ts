import { PrismaClient, type PayRun } from "@prisma/client";

const prismaClient = new PrismaClient();

export class PayRunRepository {
  // 🔹 Création d’un cycle de paie
  async create(
    data: Omit<PayRun, "id" | "createdAt" | "updatedAt">
  ): Promise<PayRun> {
    return prismaClient.payRun.create({ data });
  }

  // 🔹 Recherche par ID
  async findById(id: number): Promise<PayRun | null> {
    return prismaClient.payRun.findUnique({
      where: { id },
      include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true }
    });
  }

  // 🔹 Recherche avec filtres
  async findAll(filters?: {
    entrepriseId?: number;
    status?: string;
    createdById?: number;
  }): Promise<PayRun[]> {
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

    return prismaClient.payRun.findMany({
      where,
      include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true },
      orderBy: { createdAt: "desc" }
    });
  }

  // 🔹 Mise à jour d’un cycle de paie
  async update(
    id: number,
    data: Partial<Omit<PayRun, "id" | "createdAt" | "updatedAt">>
  ): Promise<PayRun> {
    return prismaClient.payRun.update({
      where: { id },
      data,
      include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true }
    });
  }

  // 🔹 Suppression
  async delete(id: number): Promise<PayRun> {
    return prismaClient.payRun.delete({
      where: { id }
    });
  }
}