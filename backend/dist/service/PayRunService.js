import { PayRunRepository } from "../repository/PayRunRepository.js";
import { EmployeeRepository } from "../repository/EmployeeRepository.js";
import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class PayRunService {
    payRunRepository = new PayRunRepository();
    employeeRepository = new EmployeeRepository();
    // 🔹 Création d’un cycle de paie
    async create(data, createdById) {
        const payRun = await this.payRunRepository.create({
            ...data,
            createdById: createdById || null
        });
        // Générer automatiquement les bulletins pour tous les employés actifs de l'entreprise
        await this.generatePayslips(payRun.id, payRun.entrepriseId);
        return this.payRunRepository.findById(payRun.id);
    }
    async findById(id) {
        return this.payRunRepository.findById(id);
    }
    async findAll(filters) {
        return this.payRunRepository.findAll(filters);
    }
    async update(id, data) {
        return this.payRunRepository.update(id, data);
    }
    async delete(id) {
        return this.payRunRepository.delete(id);
    }
    // 🔹 Approuver un cycle de paie
    async approve(id) {
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
    async close(id) {
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
    async generatePayslips(payRunId, entrepriseId) {
        const employees = await this.employeeRepository.findAll({ entrepriseId, actif: true });
        for (const employee of employees) {
            // Calculer le brut selon le type de contrat
            let brut = employee.tauxSalaire;
            if (employee.typeContrat === 'JOURNALIER') {
                // Pour les journaliers, on pourrait avoir un nombre de jours, mais pour l'instant on prend le taux fixe
                brut = employee.tauxSalaire; // TODO: ajuster selon nombre de jours travaillés
            }
            // Créer le bulletin
            await prismaClient.payslip.create({
                data: {
                    payRunId,
                    employeeId: employee.id,
                    brut,
                    deductions: 0, // TODO: calculer les déductions
                    net: brut
                }
            });
        }
    }
}
//# sourceMappingURL=PayRunService.js.map