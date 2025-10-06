import type { Request, Response } from "express";
import { DashboardService } from "../service/DashboardService.js";

export class DashboardController {
  private dashboardService = new DashboardService();

  // 🔹 Obtenir les KPIs pour une entreprise
  async getKPIs(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      let entrepriseId: number;

      // Déterminer l'entreprise selon le rôle
      if (req.query.entrepriseId && user.role === 'SUPER_ADMIN') {
        entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.entrepriseId) {
        entrepriseId = user.entrepriseId;
      } else {
        res.status(400).json({ message: "Entreprise ID required" });
        return;
      }

      const kpis = await this.dashboardService.getKPIs(entrepriseId);
      res.json(kpis);
    } catch (error: any) {
      console.error('Error getting KPIs:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Obtenir l'évolution de la masse salariale
  async getPayrollEvolution(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      let entrepriseId: number;

      if (req.query.entrepriseId && user.role === 'SUPER_ADMIN') {
        entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.entrepriseId) {
        entrepriseId = user.entrepriseId;
      } else {
        res.status(400).json({ message: "Entreprise ID required" });
        return;
      }

      const evolution = await this.dashboardService.getPayrollEvolution(entrepriseId);
      res.json(evolution);
    } catch (error: any) {
      console.error('Error getting payroll evolution:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Obtenir les prochains paiements
  async getUpcomingPayments(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      let entrepriseId: number;

      if (req.query.entrepriseId && user.role === 'SUPER_ADMIN') {
        entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.entrepriseId) {
        entrepriseId = user.entrepriseId;
      } else {
        res.status(400).json({ message: "Entreprise ID required" });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const upcomingPayments = await this.dashboardService.getUpcomingPayments(entrepriseId, limit);
      res.json(upcomingPayments);
    } catch (error: any) {
      console.error('Error getting upcoming payments:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Obtenir les statistiques globales (SUPER_ADMIN seulement)
  async getGlobalStats(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      
      if (user.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: "Access denied. Super admin only." });
        return;
      }

      const globalStats = await this.dashboardService.getGlobalStats();
      res.json(globalStats);
    } catch (error: any) {
      console.error('Error getting global stats:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Obtenir toutes les données du dashboard en une seule requête
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      let entrepriseId: number;

      if (req.query.entrepriseId && user.role === 'SUPER_ADMIN') {
        entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.entrepriseId) {
        entrepriseId = user.entrepriseId;
      } else {
        res.status(400).json({ message: "Entreprise ID required" });
        return;
      }

      // Récupérer toutes les données en parallèle
      const [kpis, evolution, upcomingPayments] = await Promise.all([
        this.dashboardService.getKPIs(entrepriseId),
        this.dashboardService.getPayrollEvolution(entrepriseId),
        this.dashboardService.getUpcomingPayments(entrepriseId, 10)
      ]);

      res.json({
        kpis,
        evolution,
        upcomingPayments
      });
    } catch (error: any) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ message: error.message });
    }
  }
}