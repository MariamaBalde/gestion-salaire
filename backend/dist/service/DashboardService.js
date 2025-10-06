import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
export class DashboardService {
    async getKPIs(entrepriseId) {
        try {
            const employesActifs = await prismaClient.employe.count({
                where: {
                    entrepriseId,
                    actif: true
                }
            });
            const lastApprovedPayRun = await prismaClient.payRun.findFirst({
                where: {
                    entrepriseId,
                    status: { in: ['APPROUVE', 'CLOTURE'] }
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    payslips: true
                }
            });
            let masseSalariale = 0;
            let montantPaye = 0;
            let montantRestant = 0;
            if (lastApprovedPayRun) {
                masseSalariale = lastApprovedPayRun.payslips.reduce((sum, payslip) => sum + payslip.brut, 0);
                // Calculer le montant payé
                const payments = await prismaClient.payment.findMany({
                    where: {
                        payslip: {
                            payRunId: lastApprovedPayRun.id
                        }
                    }
                });
                montantPaye = payments.reduce((sum, payment) => sum + payment.montant, 0);
                montantRestant = masseSalariale - montantPaye;
            }
            else {
                // Si pas de cycle de paie, calculer sur la base des salaires des employés actifs
                const employees = await prismaClient.employe.findMany({
                    where: {
                        entrepriseId,
                        actif: true
                    }
                });
                masseSalariale = employees.reduce((sum, emp) => sum + emp.tauxSalaire, 0);
                montantRestant = masseSalariale; // Tout est en attente
            }
            return {
                masseSalariale,
                montantPaye,
                montantRestant,
                employesActifs
            };
        }
        catch (error) {
            console.error('Error calculating KPIs:', error);
            throw new Error('Failed to calculate KPIs');
        }
    }
    // 🔹 Évolution de la masse salariale sur les 6 derniers mois
    async getPayrollEvolution(entrepriseId) {
        try {
            // Récupérer tous les payRuns approuvés/clôturés pour avoir des données à afficher
            const payRuns = await prismaClient.payRun.findMany({
                where: {
                    entrepriseId,
                    status: { in: ['APPROUVE', 'CLOTURE'] }
                },
                include: {
                    payslips: true
                },
                orderBy: { createdAt: 'asc' }
            });
            // Si pas assez de données récentes, prendre les 6 derniers cycles disponibles
            const recentPayRuns = payRuns.slice(-6);
            // Grouper par mois
            const monthlyData = {};
            recentPayRuns.forEach(payRun => {
                const date = new Date(payRun.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });
                const masseSalariale = payRun.payslips.reduce((sum, payslip) => sum + payslip.brut, 0);
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthName,
                        year: date.getFullYear(),
                        masseSalariale: 0
                    };
                }
                monthlyData[monthKey].masseSalariale += masseSalariale;
            });
            return Object.values(monthlyData).sort((a, b) => {
                if (a.year !== b.year)
                    return a.year - b.year;
                return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
            });
        }
        catch (error) {
            console.error('Error getting payroll evolution:', error);
            throw new Error('Failed to get payroll evolution');
        }
    }
    // 🔹 Prochains paiements à effectuer
    async getUpcomingPayments(entrepriseId, limit = 10) {
        try {
            const upcomingPayslips = await prismaClient.payslip.findMany({
                where: {
                    payRun: {
                        entrepriseId,
                        status: { in: ['APPROUVE', 'CLOTURE'] }
                    },
                    status: { in: ['ATTENTE', 'PARTIEL'] }
                },
                include: {
                    employee: true,
                    payments: true,
                    payRun: true
                },
                orderBy: {
                    payRun: {
                        dateFin: 'asc'
                    }
                },
                take: limit
            });
            return upcomingPayslips.map(payslip => {
                const totalPaid = payslip.payments.reduce((sum, payment) => sum + payment.montant, 0);
                const montantRestant = payslip.net - totalPaid;
                return {
                    id: payslip.id,
                    employeeName: payslip.employee.nomComplet,
                    montant: montantRestant,
                    dateEcheance: payslip.payRun.dateFin,
                    status: payslip.status,
                    payslipId: payslip.id
                };
            }).filter(payment => payment.montant > 0);
        }
        catch (error) {
            console.error('Error getting upcoming payments:', error);
            throw new Error('Failed to get upcoming payments');
        }
    }
    // 🔹 Statistiques globales pour SUPER_ADMIN
    async getGlobalStats() {
        try {
            const [totalEntreprises, totalEmployes, lastMonthPayRuns, totalPayments] = await Promise.all([
                prismaClient.entreprise.count(),
                prismaClient.employe.count({ where: { actif: true } }),
                prismaClient.payRun.findMany({
                    where: {
                        status: { in: ['APPROUVE', 'CLOTURE'] },
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    },
                    include: { payslips: true }
                }),
                prismaClient.payment.aggregate({
                    _sum: { montant: true },
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                })
            ]);
            const totalMasseSalariale = lastMonthPayRuns.reduce((sum, payRun) => sum + payRun.payslips.reduce((payslipSum, payslip) => payslipSum + payslip.brut, 0), 0);
            return {
                totalEntreprises,
                totalEmployes,
                totalMasseSalariale,
                totalPaiements: totalPayments._sum.montant || 0
            };
        }
        catch (error) {
            console.error('Error getting global stats:', error);
            throw new Error('Failed to get global stats');
        }
    }
}
//# sourceMappingURL=DashboardService.js.map