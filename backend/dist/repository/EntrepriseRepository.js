import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class EntrepriseRepository {
    // 🔹 Création d’une entreprise
    async create(data) {
        return prismaClient.entreprise.create({ data });
    }
    // 🔹 Recherche par ID
    async findById(id) {
        return prismaClient.entreprise.findUnique({
            where: { id },
            include: { employes: true, utilisateurs: true }
        });
    }
    // 🔹 Recherche avec filtres
    async findAll(filters) {
        const where = {};
        if (filters?.nom) {
            where.nom = { contains: filters.nom };
        }
        return prismaClient.entreprise.findMany({
            where,
            include: { employes: true, utilisateurs: true },
            orderBy: { createdAt: "desc" }
        });
    }
    // 🔹 Mise à jour d’une entreprise
    async update(id, data) {
        return prismaClient.entreprise.update({
            where: { id },
            data,
            include: { employes: true, utilisateurs: true }
        });
    }
    // 🔹 Suppression
    async delete(id) {
        return prismaClient.entreprise.delete({
            where: { id }
        });
    }
}
//# sourceMappingURL=EntrepriseRepository.js.map