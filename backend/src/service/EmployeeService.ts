import { EmployeeRepository } from "../repository/EmployeeRepository.js";
import type { Employe, Prisma } from "@prisma/client";

export class EmployeeService {
  private employeeRepository = new EmployeeRepository();

  async create(data: {
    nomComplet: string;
    poste: string;
    typeContrat: string;
    tauxSalaire: number;
    coordonneesBancaires?: string;
    entrepriseId: number;
  }): Promise<Employe> {
    return this.employeeRepository.create({
      nomComplet: data.nomComplet,
      poste: data.poste,
      typeContrat: data.typeContrat as any,
      tauxSalaire: data.tauxSalaire,
      coordonneesBancaires: data.coordonneesBancaires || null,
      entreprise: { connect: { id: data.entrepriseId } }
    });
  }

  async findById(id: number): Promise<Employe | null> {
    return this.employeeRepository.findById(id);
  }

  async findAll(filters?: {
    actif?: boolean;
    poste?: string;
    typeContrat?: string;
    entrepriseId?: number;
  }): Promise<Employe[]> {
    return this.employeeRepository.findAll(filters);
  }

  async update(id: number, data: {
    nomComplet?: string;
    poste?: string;
    typeContrat?: string;
    tauxSalaire?: number;
    coordonneesBancaires?: string;
  }): Promise<Employe> {
    const updateData: Prisma.EmployeUpdateInput = {};

    if (data.nomComplet) updateData.nomComplet = data.nomComplet;
    if (data.poste) updateData.poste = data.poste;
    if (data.typeContrat) updateData.typeContrat = data.typeContrat as any;
    if (data.tauxSalaire !== undefined) updateData.tauxSalaire = data.tauxSalaire;
    if (data.coordonneesBancaires !== undefined) updateData.coordonneesBancaires = data.coordonneesBancaires;

    return this.employeeRepository.update(id, updateData);
  }

  async delete(id: number): Promise<Employe> {
    return this.employeeRepository.delete(id);
  }

  async toggleActive(id: number): Promise<Employe> {
    return this.employeeRepository.toggleActive(id);
  }
}