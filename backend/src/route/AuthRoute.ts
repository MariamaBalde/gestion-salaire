import { Router } from "express";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";
import { AuthController } from "../controller/AuthController.js";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/login", authController.login.bind(authController));

authRouter.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
});

authRouter.get("/admin", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => {
    res.json({ message: "Bienvenue Admin" });
});

export { authRouter };