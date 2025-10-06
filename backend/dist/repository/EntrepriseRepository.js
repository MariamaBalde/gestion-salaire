import { PrismaClient } from "@prisma/client";
export class EntrepriseRepository {
    getPrismaClient() {
        return new PrismaClient();
    }
    // 🔹 Création d’une entreprise
    async create(data) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.entreprise.create({ data });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    // 🔹 Recherche par ID
    async findById(id) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.entreprise.findUnique({
                where: { id },
                include: { employes: true, utilisateurs: true }
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
            if (filters?.nom) {
                where.nom = { contains: filters.nom };
            }
            if (filters?.createdById) {
                where.createdById = filters.createdById;
            }
            if (filters?.id) {
                where.id = filters.id;
            }
            return await prismaClient.entreprise.findMany({
                where,
                include: { employes: true, utilisateurs: true },
                orderBy: { createdAt: "desc" }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    // 🔹 Mise à jour d’une entreprise
    async update(id, data) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.entreprise.update({
                where: { id },
                data,
                include: { employes: true, utilisateurs: true }
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
            return await prismaClient.entreprise.delete({
                where: { id }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
}
//# sourceMappingURL=EntrepriseRepository.js.map