import type { Request, Response } from "express";
import { PaymentService } from "../service/PaymentService.js";
import { PDFService } from "../service/PDFService.js";

export class PaymentController {
  private paymentService = new PaymentService();
  private pdfService = new PDFService();

  // 🔹 Créer un paiement
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const payment = await this.paymentService.create(req.body, user.id);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      const user = req.user as any;

      if (req.query.payslipId) {
        filters.payslipId = parseInt(req.query.payslipId as string);
      }

      if (req.query.entrepriseId) {
        filters.entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        filters.entrepriseId = user.entrepriseId;
      }
      // SUPER_ADMIN voit tous

      const payments = await this.paymentService.findAll(filters);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.findById(Number(id));

      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      const user = req.user as any;
      if ((user.role === 'ADMIN' || user.role === 'CAISSIER') &&
          (payment as any).payslip.employee.entrepriseId !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.update(Number(id), req.body);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.paymentService.delete(Number(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Générer et télécharger le reçu PDF
  async generateReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.findById(Number(id));

      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      const user = req.user as any;
      if ((user.role === 'ADMIN' || user.role === 'CAISSIER') &&
          (payment as any).payslip.employee.entrepriseId !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const pdfBuffer = await this.pdfService.generatePaymentReceipt(payment as any);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}