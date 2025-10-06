import { Router } from "express";
import { PayslipController } from "../controller/PayslipController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const payslipRouter = Router();
const payslipController = new PayslipController();

payslipRouter.use(authMiddleware);

payslipRouter.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payslipController.findAll(req, res));

payslipRouter.get("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payslipController.findById(req, res));

payslipRouter.post("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payslipController.create(req, res));

payslipRouter.put("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payslipController.update(req, res));

payslipRouter.delete("/:id", roleMiddleware(["SUPER_ADMIN"]), (req, res) => payslipController.delete(req, res));

export { payslipRouter };