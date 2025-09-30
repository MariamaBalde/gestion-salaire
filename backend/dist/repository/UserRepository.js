import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class UserRepository {
    findAll() {
        return prismaClient.utilisateur.findMany();
    }
    create(data) {
        return prismaClient.utilisateur.create({ data });
    }
    findByEmail(email) {
        return prismaClient.utilisateur.findUnique({
            where: { email },
        });
    }
    findByEntreprise(entrepriseId) {
        return prismaClient.utilisateur.findMany({
            where: { entrepriseId },
        });
    }
    findById(id) {
        return prismaClient.utilisateur.findUnique({
            where: { id },
            include: { entreprise: true }
        });
    }
    update(id, data) {
        return prismaClient.utilisateur.update({
            where: { id },
            data,
        });
    }
    delete(id) {
        return prismaClient.utilisateur.delete({
            where: { id },
        });
    }
}
//# sourceMappingURL=UserRepository.js.map