import { Router } from "express";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";
import { AuthController } from "../controller/AuthController.js";
import { PrismaClient } from "@prisma/client";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/login", authController.login.bind(authController));
authRouter.post("/register", authController.register.bind(authController));

authRouter.get("/me", authMiddleware, async (req, res) => {
    try {
        const prismaClient = new PrismaClient();
        const user = await prismaClient.utilisateur.findUnique({
            where: { id: (req.user as any).id },
            include: { entreprise: true }
        });
        await prismaClient.$disconnect();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

authRouter.get("/admin", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => {
    res.json({ message: "Bienvenue Admin" });
});

export { authRouter };