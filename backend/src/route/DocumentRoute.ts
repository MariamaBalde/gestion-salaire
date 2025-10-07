import { Router } from "express";
import { DocumentController } from "../controller/DocumentController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const documentRouter = Router();
const documentController = new DocumentController();

documentRouter.use(authMiddleware);

documentRouter.post("/invoice/pdf", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => documentController.generateInvoice(req, res));

export { documentRouter };