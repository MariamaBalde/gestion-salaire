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
}
//# sourceMappingURL=UserRepository.js.map