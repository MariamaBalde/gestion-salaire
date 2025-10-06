import { PrismaClient, type Payslip } from "@prisma/client";

export class PayslipRepository {
  private getPrismaClient() {
    return new PrismaClient();
  }

  // 🔹 Création d’un bulletin
  async create(
    data: Omit<Payslip, "id" | "createdAt" | "updatedAt">
  ): Promise<Payslip> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payslip.create({ data });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche par ID
  async findById(id: number): Promise<Payslip | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payslip.findUnique({
        where: { id },
        include: { employee: true, payRun: { include: { entreprise: true } }, payments: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche avec filtres
  async findAll(filters?: {
    payRunId?: number;
    employeeId?: number;
    entrepriseId?: number;
    status?: string;
  }): Promise<Payslip[]> {
    const prismaClient = this.getPrismaClient();
    try {
      const where: any = {};

      if (filters?.payRunId) {
        where.payRunId = filters.payRunId;
      }

      if (filters?.employeeId) {
        where.employeeId = filters.employeeId;
      }

      if (filters?.entrepriseId) {
        where.payRun = { entrepriseId: filters.entrepriseId };
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      return await prismaClient.payslip.findMany({
        where,
        include: { employee: true, payRun: { include: { entreprise: true } }, payments: true },
        orderBy: { createdAt: "desc" }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Mise à jour d’un bulletin
  async update(
    id: number,
    data: Partial<Omit<Payslip, "id" | "createdAt" | "updatedAt">>
  ): Promise<Payslip> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payslip.update({
        where: { id },
        data,
        include: { employee: true, payRun: { include: { entreprise: true } }, payments: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Suppression
  async delete(id: number): Promise<Payslip> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payslip.delete({
        where: { id }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }
}