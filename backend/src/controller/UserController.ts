import type { Request, Response } from "express";
import { UserService } from "../service/UserService.js";

export class UserController {
  private userService = new UserService();

  async Inscription(req: Request, res: Response): Promise<void> {
    try {
      const { nom, email, motDePasse, role } = req.body;

      const utilisateur = await this.userService.create({
        nom,
        email,
        motDePasse,
        role
      });

      res.status(201).json({
        message: "Utilisateur créé avec succès",
        utilisateur,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const utilisateurs = await this.userService.findAll();
      res.json(utilisateurs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
