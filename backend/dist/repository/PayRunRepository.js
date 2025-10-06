import { PrismaClient } from "@prisma/client";
export class PayRunRepository {
    getPrismaClient() {
        return new PrismaClient();
    }
    // 🔹 Création d’un cycle de paie
    async create(data) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.payRun.create({ data });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    // 🔹 Recherche par ID
    async findById(id) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.payRun.findUnique({
                where: { id },
                include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    // 🔹 Recherche avec filtres
    async findAll(filters) {
        const prismaClient = this.getPrismaClient();
        try {
            const where = {};
            if (filters?.entrepriseId) {
                where.entrepriseId = filters.entrepriseId;
            }
            if (filters?.status) {
                where.status = filters.status;
            }
            if (filters?.createdById) {
                where.createdById = filters.createdById;
            }
            return await prismaClient.payRun.findMany({
                where,
                include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true },
                orderBy: { createdAt: "desc" }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    // 🔹 Mise à jour d’un cycle de paie
    async update(id, data) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.payRun.update({
                where: { id },
                data,
                include: { payslips: { include: { employee: true, payments: true } }, entreprise: true, createdBy: true }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    // 🔹 Suppression
    async delete(id) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.payRun.delete({
                where: { id }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
}
//# sourceMappingURL=PayRunRepository.js.map