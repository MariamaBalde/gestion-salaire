import type { Request, Response } from "express";
import { UserService } from "../service/UserService.js";
import { registerSchema } from "../validation/validation.js";

export class UserController {
  private userService = new UserService();

  async Inscription(req: Request, res: Response): Promise<void> {
    try {
      console.log('Received registration data:', req.body);
      const { nom, email, motDePasse, role, entrepriseId } = req.body;

      if (!entrepriseId) {
        res.status(400).json({ message: "L'ID de l'entreprise est requis" });
        return;
      }

      // Create user
      const utilisateur = await this.userService.create({
        nom,
        email,
        motDePasse,
        role: role || 'ADMIN',
        entrepriseId: parseInt(entrepriseId),
        actif: true
      });

      res.status(201).json({
        message: "Utilisateur créé avec succès",
        utilisateur: { ...utilisateur, motDePasse: undefined },
      });
    } catch (error: any) {
      console.error('Error in user creation:', error);
      res.status(400).json({ 
        message: error.message || "Erreur lors de la création de l'utilisateur"
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      let utilisateurs;
      if (user.role === 'SUPER_ADMIN') {
        utilisateurs = await this.userService.findAll();
      } else {
        utilisateurs = await this.userService.findByEntreprise(user.entrepriseId);
      }
      res.json(utilisateurs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "ID requis" });
        return;
      }
      const data = req.body;
      console.log('UserController update - received data:', data);
      console.log('UserController update - data types:', Object.keys(data).map(key => `${key}: ${typeof data[key]}`));

      // Clean up the data
      const cleanData: any = {};
      if (data.nom) cleanData.nom = data.nom;
      if (data.email) cleanData.email = data.email;
      if (data.role) cleanData.role = data.role;
      if (data.actif !== undefined) cleanData.actif = data.actif;
      if (data.entrepriseId !== undefined && data.entrepriseId !== '') {
        cleanData.entrepriseId = parseInt(data.entrepriseId);
      } else if (data.entrepriseId === '') {
        cleanData.entrepriseId = null;
      }

      console.log('UserController update - cleaned data:', cleanData);

      const utilisateur = await this.userService.update(parseInt(id), cleanData);
      res.json(utilisateur);
    } catch (error: any) {
      console.error('UserController update error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "ID requis" });
        return;
      }
      await this.userService.delete(parseInt(id));
      res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
