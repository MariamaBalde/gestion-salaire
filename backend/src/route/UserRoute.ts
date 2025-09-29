import { Router } from "express";
import { UserController } from "../controller/UserController.js";

const userController = new UserController();

export const userRouter = Router();

userRouter.post("/inscription", (req, res) => userController.Inscription(req, res));

userRouter.get("/", (req, res) => userController.getAll(req, res));

