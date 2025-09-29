import { Router } from "express";
import { EmployeeController } from "../controller/EmployeeController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";
const employeeRouter = Router();
const employeeController = new EmployeeController();
employeeRouter.use(authMiddleware);
employeeRouter.get("/", roleMiddleware(["ADMIN", "CAISSIER"]), employeeController.findAll);
employeeRouter.get("/:id", roleMiddleware(["ADMIN", "CAISSIER"]), employeeController.findById);
employeeRouter.post("/", roleMiddleware(["ADMIN"]), (req, res) => employeeController.create(req, res));
employeeRouter.put("/:id", roleMiddleware(["ADMIN"]), employeeController.update);
employeeRouter.delete("/:id", roleMiddleware(["ADMIN"]), employeeController.delete);
employeeRouter.patch("/:id/toggle-active", roleMiddleware(["ADMIN"]), employeeController.toggleActive);
export { employeeRouter };
//# sourceMappingURL=EmployeeRoute.js.map