import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class EmployeeRepository {
    async create(data) {
        return prismaClient.employe.create({ data });
    }
    async findById(id) {
        return prismaClient.employe.findUnique({
            where: { id },
            include: { entreprise: true },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.actif !== undefined) {
            where.actif = filters.actif;
        }
        if (filters?.poste) {
            where.poste = { contains: filters.poste };
        }
        if (filters?.typeContrat) {
            where.typeContrat = filters.typeContrat;
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
    }
    async update(id, data) {
        return prismaClient.employe.update({
            where: { id },
            data,
            include: { entreprise: true },
        });
    }
    async delete(id) {
        return prismaClient.employe.delete({
            where: { id },
        });
    }
    async toggleActive(id) {
        const employee = await this.findById(id);
        if (!employee)
            throw new Error("Employee not found");
        return this.update(id, { actif: !employee.actif });
    }
}
//# sourceMappingURL=EmployeeRepository.js.map