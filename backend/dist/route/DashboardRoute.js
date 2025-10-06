import { Router } from "express";
import { DashboardController } from "../controller/DashboardController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware } from "../middleware/RoleMiddleware.js";
const router = Router();
const dashboardController = new DashboardController();
// 🔹 Toutes les routes nécessitent une authentification
router.use(authMiddleware);
// 🔹 Obtenir les KPIs pour une entreprise
router.get("/kpis", dashboardController.getKPIs.bind(dashboardController));
// 🔹 Obtenir l'évolution de la masse salariale (6 derniers mois)
router.get("/payroll-evolution", dashboardController.getPayrollEvolution.bind(dashboardController));
// 🔹 Obtenir les prochains paiements à effectuer
router.get("/upcoming-payments", dashboardController.getUpcomingPayments.bind(dashboardController));
// 🔹 Obtenir toutes les données du dashboard en une seule requête
router.get("/data", dashboardController.getDashboardData.bind(dashboardController));
// 🔹 Statistiques globales (SUPER_ADMIN seulement)
router.get("/global-stats", RoleMiddleware(['SUPER_ADMIN']), dashboardController.getGlobalStats.bind(dashboardController));
export { router as DashboardRoute };
//# sourceMappingURL=DashboardRoute.js.map