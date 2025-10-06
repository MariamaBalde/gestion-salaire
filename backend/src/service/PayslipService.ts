import { PayslipRepository } from "../repository/PayslipRepository.js";
import type { Payslip } from "@prisma/client";

export class PayslipService {
  private payslipRepository = new PayslipRepository();

  // 🔹 Création d’un bulletin
  async create(
    data: Omit<Payslip, "id" | "createdAt" | "updatedAt">
  ): Promise<Payslip> {
    return this.payslipRepository.create(data);
  }

  async findById(id: number): Promise<Payslip | null> {
    return this.payslipRepository.findById(id);
  }

  async findAll(filters?: {
    payRunId?: number;
    employeeId?: number;
    entrepriseId?: number;
    status?: string;
  }): Promise<Payslip[]> {
    return this.payslipRepository.findAll(filters);
  }

  async update(
    id: number,
    data: Partial<Omit<Payslip, "id" | "createdAt" | "updatedAt">>
  ): Promise<Payslip> {
    // Check if payslip can be edited (only if payrun is BROUILLON)
    const payslip = await this.payslipRepository.findById(id) as any;
    if (!payslip) {
      throw new Error("Payslip not found");
    }

    if (payslip.payRun.status !== 'BROUILLON') {
      throw new Error("Cannot edit payslip: PayRun is not in draft status");
    }

    return this.payslipRepository.update(id, data);
  }

  async delete(id: number): Promise<Payslip> {
    // Check if can delete
    const payslip = await this.payslipRepository.findById(id) as any;
    if (!payslip) {
      throw new Error("Payslip not found");
    }

    if (payslip.payRun.status !== 'BROUILLON') {
      throw new Error("Cannot delete payslip: PayRun is not in draft status");
    }

    return this.payslipRepository.delete(id);
  }
}