import { Router } from "express";
import { EntrepriseController } from "../controller/EntrepriseController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";
const entrepriseRouter = Router();
const entrepriseController = new EntrepriseController();
// All routes require authentication
entrepriseRouter.use(authMiddleware);
// Get all entreprises
entrepriseRouter.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), entrepriseController.findAll);
// Get entreprise by ID
entrepriseRouter.get("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), entrepriseController.findById);
// Create new entreprise (Admin can create for testing)
entrepriseRouter.post("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), entrepriseController.create);
export { entrepriseRouter };
//# sourceMappingURL=EntrepriseRoute.js.map