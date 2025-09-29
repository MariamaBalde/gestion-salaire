import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class EntrepriseRepository {
    async create(data) {
        return prismaClient.entreprise.create({
            data: {
                nom: data.nom,
                logo: data.logo || null,
                adresse: data.adresse,
                devise: data.devise || "XOF",
                typePeriode: data.typePeriode || "MENSUELLE"
            }
        });
    }
    async findById(id) {
        return prismaClient.entreprise.findUnique({
            where: { id }
        });
    }
    async findAll() {
        return prismaClient.entreprise.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
}
//# sourceMappingURL=EntrepriseRepository.js.map