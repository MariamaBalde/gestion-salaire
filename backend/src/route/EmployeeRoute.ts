import { Router } from "express";
import { EmployeeController } from "../controller/EmployeeController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const employeeRouter = Router();
const employeeController = new EmployeeController();

employeeRouter.use(authMiddleware);

employeeRouter.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => employeeController.findAll(req, res));

employeeRouter.get("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => employeeController.findById(req, res));

employeeRouter.post("/", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => employeeController.create(req, res));

employeeRouter.put("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => employeeController.update(req, res));

employeeRouter.delete("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => employeeController.delete(req, res));

employeeRouter.patch("/:id/toggle-active", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => employeeController.toggleActive(req, res));

export { employeeRouter };