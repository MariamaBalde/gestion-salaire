import { PrismaClient } from "@prisma/client";
export class UserRepository {
    getPrismaClient() {
        return new PrismaClient();
    }
    async findAll() {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.findMany();
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    async create(data) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.create({ data });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    async findByEmail(email) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.findUnique({
                where: { email },
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    async findByEntreprise(entrepriseId) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.findMany({
                where: { entrepriseId },
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    async findById(id) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.findUnique({
                where: { id },
                include: { entreprise: true }
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    async update(id, data) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.update({
                where: { id },
                data,
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
    async delete(id) {
        const prismaClient = this.getPrismaClient();
        try {
            return await prismaClient.utilisateur.delete({
                where: { id },
            });
        }
        finally {
            await prismaClient.$disconnect();
        }
    }
}
//# sourceMappingURL=UserRepository.js.map