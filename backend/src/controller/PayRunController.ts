import type { Request, Response } from "express";
import { PayRunService } from "../service/PayRunService.js";
import { payRunSchema } from "../validation/validation.js";

export class PayRunController {
  private payRunService = new PayRunService();

  // 🔹 Créer un cycle de paie
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const body = { ...req.body };

      if (user.role === 'ADMIN') {
        if (!body.entrepriseId) {
          body.entrepriseId = user.entrepriseId;
        }
      }
      // SUPER_ADMIN peut spécifier entrepriseId

      const validatedData = payRunSchema.parse(body);
      const payRunData = {
        ...validatedData,
        dateDebut: new Date(validatedData.dateDebut),
        dateFin: new Date(validatedData.dateFin),
        status: 'BROUILLON' as const
      };
      const payRun = await this.payRunService.create(payRunData, user.id);
      res.status(201).json(payRun);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      const user = req.user as any;

      if (req.query.entrepriseId) {
        filters.entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.role === 'ADMIN') {
        filters.entrepriseId = user.entrepriseId;
      }
      // SUPER_ADMIN voit tous

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const payRuns = await this.payRunService.findAll(filters);
      res.json(payRuns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payRun = await this.payRunService.findById(Number(id));

      if (!payRun) {
        res.status(404).json({ message: "PayRun not found" });
        return;
      }

      const user = req.user as any;
      if (user.role === 'ADMIN' && payRun.entrepriseId !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json(payRun);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payRun = await this.payRunService.update(Number(id), req.body);
      res.json(payRun);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.payRunService.delete(Number(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Approuver un cycle de paie
  async approve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payRun = await this.payRunService.approve(Number(id));
      res.json(payRun);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Clôturer un cycle de paie
  async close(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payRun = await this.payRunService.close(Number(id));
      res.json(payRun);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}