import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class AuthRepository {
    async login(email, motDePasse) {
        return prismaClient.utilisateur.findUnique({
            where: { email }
        });
    }
}
//# sourceMappingURL=authRepository.js.map