import type { Request, Response } from "express";
import { EntrepriseService } from "../service/EntrepriseService.js";

export class EntrepriseController {
  private entrepriseService = new EntrepriseService();

  // 🔹 Créer une entreprise
  async create(req: Request, res: Response): Promise<void> {
    try {
      const entreprise = await this.entrepriseService.create(req.body);
      res.status(201).json(entreprise);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { nom } = req.query;
      const filters: any = {};

      if (nom) {
        filters.nom = nom as string;
      }

      const entreprises = await this.entrepriseService.findAll(filters);
      res.json(entreprises);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const entreprise = await this.entrepriseService.findById(Number(id));

      if (!entreprise) {
        res.status(404).json({ message: "Entreprise not found" });
        return;
      }

      res.json(entreprise);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const entreprise = await this.entrepriseService.update(Number(id), req.body);
      res.json(entreprise);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.entrepriseService.delete(Number(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}