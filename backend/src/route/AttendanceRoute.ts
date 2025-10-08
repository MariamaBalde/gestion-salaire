import { Router } from "express";
import { AttendanceController } from "../controller/AttendanceController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const attendanceRouter = Router();
const attendanceController = new AttendanceController();

attendanceRouter.use(authMiddleware);

// Routes pour la gestion des pointages
attendanceRouter.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.findAll(req, res));

attendanceRouter.get("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.findById(req, res));

attendanceRouter.post("/", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.create(req, res));

attendanceRouter.put("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.update(req, res));

attendanceRouter.delete("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => attendanceController.delete(req, res));

// Routes spéciales pour le pointage
attendanceRouter.post("/checkin", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.checkIn(req, res));

attendanceRouter.post("/checkout", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.checkOut(req, res));

attendanceRouter.post("/bulk", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.bulkCreate(req, res));

// Routes pour les statistiques et rapports
attendanceRouter.get("/stats/:employeeId", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.getStats(req, res));

attendanceRouter.get("/report/monthly", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.getMonthlyReport(req, res));

attendanceRouter.get("/report/monthly/pdf", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.generateMonthlyReportPDF(req, res));

// Routes pour la gestion des pauses
attendanceRouter.post("/break/start", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.startBreak(req, res));

attendanceRouter.post("/break/end", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.endBreak(req, res));

// Routes pour le workflow d'approbation
attendanceRouter.post("/:id/approve", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => attendanceController.approveAttendance(req, res));

attendanceRouter.post("/:id/reject", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => attendanceController.rejectAttendance(req, res));

attendanceRouter.post("/:id/correct", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => attendanceController.correctAttendance(req, res));

// Routes pour les résumés journaliers
attendanceRouter.get("/day-summaries", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.getDaySummaries(req, res));

// Routes pour l'audit trail
attendanceRouter.get("/:id/audit", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => attendanceController.getAuditTrail(req, res));

// Route de recherche avancée
attendanceRouter.get("/search", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => attendanceController.findAllWithFilters(req, res));

export { attendanceRouter };