import { PrismaClient, type Payment } from "@prisma/client";

export class PaymentRepository {
  private getPrismaClient() {
    return new PrismaClient();
  }

  // 🔹 Création d’un paiement
  async create(
    data: Omit<Payment, "id" | "createdAt" | "updatedAt">
  ): Promise<Payment> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payment.create({ data });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche par ID
  async findById(id: number): Promise<Payment | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payment.findUnique({
        where: { id },
        include: {
          payslip: {
            include: {
              employee: true,
              payRun: { include: { entreprise: true } }
            }
          },
          createdBy: true
        }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Recherche avec filtres
  async findAll(filters?: {
    payslipId?: number;
    createdById?: number;
    entrepriseId?: number;
  }): Promise<Payment[]> {
    const prismaClient = this.getPrismaClient();
    try {
      const where: any = {};

      if (filters?.payslipId) {
        where.payslipId = filters.payslipId;
      }

      if (filters?.createdById) {
        where.createdById = filters.createdById;
      }

      if (filters?.entrepriseId) {
        where.payslip = {
          employee: {
            entrepriseId: filters.entrepriseId
          }
        };
      }

      return await prismaClient.payment.findMany({
        where,
        include: {
          payslip: {
            include: {
              employee: true,
              payRun: { include: { entreprise: true } }
            }
          },
          createdBy: true
        },
        orderBy: { createdAt: "desc" }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Mise à jour d’un paiement
  async update(
    id: number,
    data: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>
  ): Promise<Payment> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payment.update({
        where: { id },
        data,
        include: { payslip: { include: { employee: true } }, createdBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // 🔹 Suppression
  async delete(id: number): Promise<Payment> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.payment.delete({
        where: { id }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }
}