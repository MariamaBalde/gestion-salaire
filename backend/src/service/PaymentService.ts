import { PaymentRepository } from "../repository/PaymentRepository.js";
import { PrismaClient } from "@prisma/client";
import type { Payment } from "@prisma/client";

const prismaClient = new PrismaClient();

export class PaymentService {
  private paymentRepository = new PaymentRepository();

  // 🔹 Création d’un paiement
  async create(
    data: Omit<Payment, "id" | "createdAt" | "updatedAt" | "createdById">,
    createdById?: number
  ): Promise<{ payment: Payment; payslip: any }> {
    // Vérifier que le montant ne dépasse pas le net restant
    const payslip = await prismaClient.payslip.findUnique({
      where: { id: data.payslipId },
      include: { payments: true }
    });

    if (!payslip) {
      throw new Error("Payslip not found");
    }

    if (payslip.status === 'PAYE') {
      throw new Error("Cannot add payment to a fully paid payslip");
    }

    const totalPaid = payslip.payments.reduce((sum, p) => sum + p.montant, 0);
    const remaining = payslip.net - totalPaid;

    if (data.montant > remaining) {
      throw new Error(`Payment amount (${data.montant}) exceeds remaining balance (${remaining})`);
    }

    const payment = await this.paymentRepository.create({
      ...data,
      createdById: createdById || null
    });

    // Mettre à jour le statut du payslip
    const updatedPayslip = await this.updatePayslipStatus(data.payslipId);

    return { payment, payslip: updatedPayslip };
  }

  async findById(id: number): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async findAll(filters?: {
    payslipId?: number;
    createdById?: number;
    entrepriseId?: number;
  }): Promise<Payment[]> {
    return this.paymentRepository.findAll(filters);
  }

  async update(
    id: number,
    data: Partial<Omit<Payment, "id" | "createdAt" | "updatedAt">>
  ): Promise<Payment> {
    const payment = await this.paymentRepository.update(id, data);

    // Mettre à jour le statut du payslip si montant modifié
    if (data.montant !== undefined) {
      await this.updatePayslipStatus(payment.payslipId);
    }

    return payment;
  }

  async delete(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    const deleted = await this.paymentRepository.delete(id);

    // Mettre à jour le statut du payslip
    await this.updatePayslipStatus(payment.payslipId);

    return deleted;
  }

  // 🔹 Mettre à jour le statut du payslip basé sur les paiements
  private async updatePayslipStatus(payslipId: number): Promise<any> {
    const payslip = await prismaClient.payslip.findUnique({
      where: { id: payslipId },
      include: { payments: true, employee: true, payRun: { include: { entreprise: true } } }
    });

    if (!payslip) throw new Error("Payslip not found");

    const totalPaid = payslip.payments.reduce((sum, p) => sum + p.montant, 0);

    let status: string;
    if (totalPaid === 0) {
      status = 'ATTENTE';
    } else if (totalPaid >= payslip.net) {
      status = 'PAYE';
    } else {
      status = 'PARTIEL';
    }

    return await prismaClient.payslip.update({
      where: { id: payslipId },
      data: { status: status as any },
      include: { payments: true, employee: true, payRun: { include: { entreprise: true } } }
    });
  }
}