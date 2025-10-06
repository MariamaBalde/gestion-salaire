import { PrismaClient, type Employe } from "@prisma/client";

export class EmployeeRepository {
  private getPrismaClient() {
    return new PrismaClient();
  }

  async create(
    data: Omit<Employe, "id" | "createdAt" | "updatedAt">
  ): Promise<Employe> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.employe.create({ data });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findById(id: number): Promise<Employe | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.employe.findUnique({
        where: { id },
        include: { entreprise: true },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findAll(filters?: {
    actif?: boolean;
    poste?: string;
    typeContrat?: string;
    entrepriseId?: number;
    entrepriseCreatedById?: number;
  }): Promise<Employe[]> {
    const prismaClient = this.getPrismaClient();
    try {
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

      if (filters?.entrepriseCreatedById) {
        where.entreprise = {
          createdById: filters.entrepriseCreatedById
        };
      }

      console.log('EmployeeRepository findAll - where clause:', where);

      const employees = await prismaClient.employe.findMany({
        where,
        include: { entreprise: true },
        orderBy: { createdAt: "desc" },
      });

      console.log('EmployeeRepository findAll - employees count:', employees.length);

      return employees;
    } finally {
      await prismaClient.$disconnect();
    }
  }


  async update(
    id: number,
    data: Partial<Omit<Employe, "id" | "createdAt" | "updatedAt">>
  ): Promise<Employe> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.employe.update({
        where: { id },
        data,
        include: { entreprise: true },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async delete(id: number): Promise<Employe> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.employe.delete({
        where: { id },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async toggleActive(id: number): Promise<Employe> {
    const employee = await this.findById(id);
    if (!employee) throw new Error("Employee not found");

    return this.update(id, { actif: !employee.actif });
  }
}
