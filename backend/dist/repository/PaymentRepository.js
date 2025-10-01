import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class PaymentRepository {
    // 🔹 Création d’un paiement
    async create(data) {
        return prismaClient.payment.create({ data });
    }
    // 🔹 Recherche par ID
    async findById(id) {
        return prismaClient.payment.findUnique({
            where: { id },
            include: {
                payslip: {
                    include: {
                        employee: true,
                        payRun: { include: { entreprise: true } }
                    }
                },
                createdBy: true
            }
        });
    }
    // 🔹 Recherche avec filtres
    async findAll(filters) {
        const where = {};
        if (filters?.payslipId) {
            where.payslipId = filters.payslipId;
        }
        if (filters?.createdById) {
            where.createdById = filters.createdById;
        }
        if (filters?.entrepriseId) {
            where.payslip = {
                employee: {
                    entrepriseId: filters.entrepriseId
                }
            };
        }
        return prismaClient.payment.findMany({
            where,
            include: {
                payslip: {
                    include: {
                        employee: true,
                        payRun: { include: { entreprise: true } }
                    }
                },
                createdBy: true
            },
            orderBy: { createdAt: "desc" }
        });
    }
    // 🔹 Mise à jour d’un paiement
    async update(id, data) {
        return prismaClient.payment.update({
            where: { id },
            data,
            include: { payslip: { include: { employee: true } }, createdBy: true }
        });
    }
    // 🔹 Suppression
    async delete(id) {
        return prismaClient.payment.delete({
            where: { id }
        });
    }
}
//# sourceMappingURL=PaymentRepository.js.map