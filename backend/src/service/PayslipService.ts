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
    const payslip = await this.payslipRepository.findById(id) as any;
    if (!payslip) {
      throw new Error("Payslip not found");
    }

    if (payslip.payRun.status !== 'BROUILLON') {
      throw new Error("Cannot edit payslip: PayRun is not in draft status");
    }

    // Si les jours travaillés sont modifiés pour un employé journalier, recalculer le brut
    if (data.joursTravailles !== undefined && data.joursTravailles !== null && payslip.employee.typeContrat === 'JOURNALIER') {
      // Validation : les jours travaillés doivent être cohérents avec la période du cycle
      const maxWorkingDays = this.calculateWorkingDays(payslip.payRun.dateDebut, payslip.payRun.dateFin);
      if (data.joursTravailles < 0 || data.joursTravailles > maxWorkingDays) {
        throw new Error(`Les jours travaillés doivent être entre 0 et ${maxWorkingDays} pour cette période`);
      }

      const newBrut = payslip.employee.tauxSalaire * data.joursTravailles;
      data.brut = newBrut;
      data.net = newBrut - (data.deductions || payslip.deductions || 0);
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

  // 🔹 Calculer le nombre de jours ouvrés entre deux dates
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Considérer comme jour ouvré du lundi au vendredi (0 = dimanche, 6 = samedi)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }
}