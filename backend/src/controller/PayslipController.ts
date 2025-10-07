import type { Request, Response } from "express";
import { PayslipService } from "../service/PayslipService.js";
import { PDFService } from "../service/PDFService.js";

export class PayslipController {
  private payslipService = new PayslipService();
  private pdfService = new PDFService();

  // 🔹 Créer un bulletin
  async create(req: Request, res: Response): Promise<void> {
    try {
      const payslip = await this.payslipService.create(req.body);
      res.status(201).json(payslip);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      const user = req.user as any;

      if (req.query.payRunId) {
        filters.payRunId = parseInt(req.query.payRunId as string);
      }

      if (req.query.employeeId) {
        filters.employeeId = parseInt(req.query.employeeId as string);
      }

      if (req.query.entrepriseId) {
        filters.entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        filters.entrepriseId = user.entrepriseId;
      }

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const payslips = await this.payslipService.findAll(filters);
      res.json(payslips);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payslip = await this.payslipService.findById(Number(id));

      if (!payslip) {
        res.status(404).json({ message: "Payslip not found" });
        return;
      }

      const user = req.user as any;
      if ((user.role === 'ADMIN' || user.role === 'CAISSIER') && (payslip as any).payRun.entrepriseId !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json(payslip);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payslip = await this.payslipService.update(Number(id), req.body);
      res.json(payslip);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.payslipService.delete(Number(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Générer et télécharger le bulletin PDF
  async generatePDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payslip = await this.payslipService.findById(Number(id));

      if (!payslip) {
        res.status(404).json({ message: "Payslip not found" });
        return;
      }

      const user = req.user as any;
      if ((user.role === 'ADMIN' || user.role === 'CAISSIER') && (payslip as any).payRun.entrepriseId !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const pdfBuffer = await this.pdfService.generatePayslipPDF(payslip as any);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Générer et télécharger les bulletins PDF en lot
  async generateBulkPDF(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      const user = req.user as any;

      if (req.query.payRunId) {
        filters.payRunId = parseInt(req.query.payRunId as string);
      }

      if (req.query.employeeId) {
        filters.employeeId = parseInt(req.query.employeeId as string);
      }

      if (req.query.entrepriseId) {
        filters.entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        filters.entrepriseId = user.entrepriseId;
      }

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const payslips = await this.payslipService.findAll(filters);

      if (!payslips || payslips.length === 0) {
        res.status(404).json({ message: "No payslips found" });
        return;
      }

      const pdfBuffer = await this.pdfService.generateBulkPayslipPDF(payslips as any);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslips-bulk-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}