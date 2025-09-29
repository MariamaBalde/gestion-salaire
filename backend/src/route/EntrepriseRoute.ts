import { Router } from "express";
import { EntrepriseController } from "../controller/EntrepriseController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const entrepriseRouter = Router();
const entrepriseController = new EntrepriseController();

entrepriseRouter.use(authMiddleware);

entrepriseRouter.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => entrepriseController.findAll(req, res));

entrepriseRouter.get("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), entrepriseController.findById);

entrepriseRouter.post("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => entrepriseController.create(req, res));

export { entrepriseRouter };