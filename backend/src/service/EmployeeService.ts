import { EmployeeRepository } from "../repository/EmployeeRepository.js";
import type { Employe } from "@prisma/client";

export class EmployeeService {
  private employeeRepository = new EmployeeRepository();

  async create(
    data: Omit<Employe, "id" | "createdAt" | "updatedAt">
  ): Promise<Employe> {
    return this.employeeRepository.create({
      ...data,
      actif: data.actif ?? true, 
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
    entrepriseCreatedById?: number;
  }): Promise<Employe[]> {
    return this.employeeRepository.findAll(filters);
  }

  async update(
    id: number,
    data: Partial<Omit<Employe, "id" | "createdAt" | "updatedAt">>
  ): Promise<Employe> {
    return this.employeeRepository.update(id, data);
  }

  async delete(id: number): Promise<Employe> {
    return this.employeeRepository.delete(id);
  }

  async toggleActive(id: number): Promise<Employe> {
    return this.employeeRepository.toggleActive(id);
  }
}
