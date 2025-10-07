import { Router } from "express";
import { PaymentController } from "../controller/PaymentController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const paymentRouter = Router();
const paymentController = new PaymentController();

paymentRouter.use(authMiddleware);

paymentRouter.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => paymentController.findAll(req, res));

paymentRouter.get("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN", "CAISSIER"]), (req, res) => paymentController.findById(req, res));

paymentRouter.post("/", roleMiddleware(["CAISSIER"]), (req, res) => paymentController.create(req, res));

paymentRouter.put("/:id", roleMiddleware(["CAISSIER"]), (req, res) => paymentController.update(req, res));

paymentRouter.delete("/:id", roleMiddleware(["SUPER_ADMIN"]), (req, res) => paymentController.delete(req, res));

paymentRouter.get("/:id/receipt", roleMiddleware(["CAISSIER"]), (req, res) => paymentController.generateReceipt(req, res));

paymentRouter.get("/list/pdf", roleMiddleware(["CAISSIER"]), (req, res) => paymentController.generatePaymentList(req, res));

export { paymentRouter };