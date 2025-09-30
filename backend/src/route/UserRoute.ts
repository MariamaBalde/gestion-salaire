import { Router } from "express";
import { UserController } from "../controller/UserController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import { RoleMiddleware as roleMiddleware } from "../middleware/RoleMiddleware.js";

const userController = new UserController();

export const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.post("/inscription", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => userController.Inscription(req, res));

userRouter.get("/", (req, res) => userController.getAll(req, res));

userRouter.put("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => userController.update(req, res));

userRouter.delete("/:id", roleMiddleware(["SUPER_ADMIN", "ADMIN"]), (req, res) => userController.delete(req, res));

