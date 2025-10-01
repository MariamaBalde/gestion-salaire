import { Router } from "express";
import { PayRunController } from "../controller/PayRunController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const payRunRouter = Router();
const payRunController = new PayRunController();

payRunRouter.use(authMiddleware);

payRunRouter.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payRunController.findAll(req, res));

payRunRouter.get("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payRunController.findById(req, res));

payRunRouter.post("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payRunController.create(req, res));

payRunRouter.put("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payRunController.update(req, res));

payRunRouter.patch("/:id/approve", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payRunController.approve(req, res));

payRunRouter.patch("/:id/close", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => payRunController.close(req, res));

payRunRouter.delete("/:id", roleMiddleware(["SUPER_ADMIN"]), (req, res) => payRunController.delete(req, res));

export { payRunRouter };