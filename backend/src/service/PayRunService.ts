import { PayRunRepository } from "../repository/PayRunRepository.js";
import { EmployeeRepository } from "../repository/EmployeeRepository.js";
import { PrismaClient } from "@prisma/client";
import type { PayRun, Payslip } from "@prisma/client";

const prismaClient = new PrismaClient();

export class PayRunService {
  private payRunRepository = new PayRunRepository();
  private employeeRepository = new EmployeeRepository();

  // 🔹 Création d’un cycle de paie
  async create(
    data: Omit<PayRun, "id" | "createdAt" | "updatedAt" | "createdById">,
    createdById?: number
  ): Promise<PayRun> {
    const payRun = await this.payRunRepository.create({
      ...data,
      createdById: createdById || null
    });

    // Générer automatiquement les bulletins pour tous les employés actifs de l'entreprise
    await this.generatePayslips(payRun.id, payRun.entrepriseId);

    return this.payRunRepository.findById(payRun.id) as Promise<PayRun>;
  }

  async findById(id: number): Promise<PayRun | null> {
    return this.payRunRepository.findById(id);
  }

  async findAll(filters?: {
    entrepriseId?: number;
    status?: string;
    createdById?: number;
  }): Promise<PayRun[]> {
    return this.payRunRepository.findAll(filters);
  }

  async update(
    id: number,
    data: Partial<Omit<PayRun, "id" | "createdAt" | "updatedAt">>
  ): Promise<PayRun> {
    return this.payRunRepository.update(id, data);
  }

  async delete(id: number): Promise<PayRun> {
    return this.payRunRepository.delete(id);
  }

  // 🔹 Approuver un cycle de paie
  async approve(id: number): Promise<PayRun> {
    const payRun = await this.payRunRepository.findById(id);
    if (!payRun) {
      throw new Error("PayRun not found");
    }

    if (payRun.status !== 'BROUILLON') {
      throw new Error("Only draft payruns can be approved");
    }

    return this.payRunRepository.update(id, { status: 'APPROUVE' });
  }

  // 🔹 Clôturer un cycle de paie
  async close(id: number): Promise<PayRun> {
    const payRun = await this.payRunRepository.findById(id);
    if (!payRun) {
      throw new Error("PayRun not found");
    }

    if (payRun.status !== 'APPROUVE') {
      throw new Error("Only approved payruns can be closed");
    }

    return this.payRunRepository.update(id, { status: 'CLOTURE' });
  }

  // 🔹 Générer les bulletins automatiquement
  private async generatePayslips(payRunId: number, entrepriseId: number): Promise<void> {
    const employees = await this.employeeRepository.findAll({ entrepriseId, actif: true });
    const payRun = await this.payRunRepository.findById(payRunId);

    if (!payRun) {
      throw new Error('PayRun not found');
    }

    for (const employee of employees) {
      // Calculer le brut selon le type de contrat
      let brut = employee.tauxSalaire;
      let joursTravailles: number | null = null;

      if (employee.typeContrat === 'JOURNALIER') {
        // Pour les journaliers, calculer le nombre de jours travaillés
        // Par défaut, on prend tous les jours ouvrés du cycle de paie
        const defaultWorkingDays = this.calculateWorkingDays(payRun.dateDebut, payRun.dateFin);
        joursTravailles = defaultWorkingDays;
        brut = employee.tauxSalaire * defaultWorkingDays;
      }

      // Créer le bulletin
      await prismaClient.payslip.create({
        data: {
          payRunId,
          employeeId: employee.id,
          joursTravailles,
          brut,
          deductions: 0, // TODO: calculer les déductions
          net: brut
        }
      });
    }
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