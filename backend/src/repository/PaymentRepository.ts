import { PrismaClient, type Payment } from "@prisma/client";

const prismaClient = new PrismaClient();

export class PaymentRepository {
  // 🔹 Création d’un paiement
  async create(
    data: Omit<Payment, "id" | "createdAt" | "updatedAt">
  ): Promise<Payment> {
    return prismaClient.payment.create({ data });
  }

  // 🔹 Recherche par ID
  async findById(id: number): Promise<Payment | null> {
    return prismaClient.payment.findUnique({
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
  }

  // 🔹 Recherche avec filtres
  async findAll(filters?: {
    payslipId?: number;
    createdById?: number;
    entrepriseId?: number;
  }): Promise<Payment[]> {
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

    return prismaClient.payment.findMany({
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
  }

  // 🔹 Mise à jour d’un paiement
  async update(
    id: number,
    data: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>
  ): Promise<Payment> {
    return prismaClient.payment.update({
      where: { id },
      data,
      include: { payslip: { include: { employee: true } }, createdBy: true }
    });
  }

  // 🔹 Suppression
  async delete(id: number): Promise<Payment> {
    return prismaClient.payment.delete({
      where: { id }
    });
  }
}