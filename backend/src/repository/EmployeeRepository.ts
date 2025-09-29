import { PrismaClient, type Employe } from "@prisma/client";

const prismaClient = new PrismaClient();

export class EmployeeRepository {
  async create(
    data: Omit<Employe, "id" | "createdAt" | "updatedAt">
  ): Promise<Employe> {
    return prismaClient.employe.create({ data });
  }

  async findById(id: number): Promise<Employe | null> {
    return prismaClient.employe.findUnique({
      where: { id },
      include: { entreprise: true },
    });
  }

  async findAll(filters?: {
    actif?: boolean;
    poste?: string;
    typeContrat?: string;
    entrepriseId?: number;
  }): Promise<Employe[]> {
    const where: any = {};

    if (filters?.actif !== undefined) {
      where.actif = filters.actif;
    }

    if (filters?.poste) {
      where.poste = { contains: filters.poste };
    }

    if (filters?.typeContrat) {
      where.typeContrat = filters.typeContrat as any;
    }

    if (filters?.entrepriseId) {
      where.entrepriseId = filters.entrepriseId;
    }

    return prismaClient.employe.findMany({
      where,
      include: { entreprise: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: number,
    data: Partial<Omit<Employe, "id" | "createdAt" | "updatedAt">>
  ): Promise<Employe> {
    return prismaClient.employe.update({
      where: { id },
      data,
      include: { entreprise: true },
    });
  }

  async delete(id: number): Promise<Employe> {
    return prismaClient.employe.delete({
      where: { id },
    });
  }

  async toggleActive(id: number): Promise<Employe> {
    const employee = await this.findById(id);
    if (!employee) throw new Error("Employee not found");

    return this.update(id, { actif: !employee.actif });
  }
}
