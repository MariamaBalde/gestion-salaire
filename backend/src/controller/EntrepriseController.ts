import type { Request, Response } from "express";
import { EntrepriseService } from "../service/EntrepriseService.js";
import { entrepriseSchema } from "../validation/validation.js";

export class EntrepriseController {
  private entrepriseService = new EntrepriseService();

  // 🔹 Créer une entreprise
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = entrepriseSchema.parse(req.body);
      const logoPath = (req as any).file
        ? `uploads/logos/${(req as any).file.filename}`
        : null;

      const entreprise = await this.entrepriseService.create({
        nom: validatedData.nom,
        adresse: validatedData.adresse,
        devise: validatedData.devise || "XOF",
        typePeriode: validatedData.typePeriode || "MENSUELLE",
        logo: logoPath,
        createdById: (req.user as any)?.id || null
      });

      res.status(201).json(entreprise);
    } catch (error: any) {
      console.error('Create error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { nom } = req.query;
      const filters: any = {};
      const user = req.user as any;

      console.log('EntrepriseController - findAll - user:', user);
      console.log('EntrepriseController - findAll - query:', req.query);

      if (nom) {
        filters.nom = nom as string;
      }

      // Modification: Ne pas filtrer pour SUPER_ADMIN
      if (user?.role === 'ADMIN') {
        filters.id = user.entrepriseId;
      } else if (user?.role === 'SUPER_ADMIN' && user?.createdById) {
        filters.createdById = user.id;
      }

      console.log('EntrepriseController - findAll - final filters:', filters);
      const entreprises = await this.entrepriseService.findAll(filters);
      res.json(entreprises);
    } catch (error: any) {
      console.error('EntrepriseController - findAll - error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      console.log('Finding enterprise by id:', req.params.id);
      const { id } = req.params;
      const entreprise = await this.entrepriseService.findById(Number(id));

      if (!entreprise) {
        console.log('Enterprise not found');
        res.status(404).json({ message: "Entreprise not found" });
        return;
      }

      const user = req.user as any;
      if (user.role === 'ADMIN' && entreprise.id !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      console.log('Enterprise found:', entreprise);
      res.json(entreprise);
    } catch (error: any) {
      console.error('Error finding enterprise:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
      }

      const updateData: any = {};

      if (req.body.nom !== undefined) updateData.nom = req.body.nom;
      if (req.body.adresse !== undefined) updateData.adresse = req.body.adresse;
      if (req.body.devise !== undefined) updateData.devise = req.body.devise;
      if (req.body.typePeriode !== undefined) updateData.typePeriode = req.body.typePeriode;

      if ((req as any).file) {
        updateData.logo = `uploads/logos/${(req as any).file.filename}`;
      } else if (req.body.logo === null) {
        updateData.logo = null;
      }

      const entreprise = await this.entrepriseService.update(numericId, updateData);
      res.json(entreprise);
    } catch (error: any) {
      console.error('Update error:', error);
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