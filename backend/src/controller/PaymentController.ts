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
      if (user.role !== 'CAISSIER') {
        res.status(403).json({ message: "Access denied. Only cashiers can create payments." });
        return;
      }
      const result = await this.paymentService.create(req.body, user.id);
      res.status(201).json(result);
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
      const user = req.user as any;
      if (user.role !== 'CAISSIER') {
        res.status(403).json({ message: "Access denied. Only cashiers can generate receipts." });
        return;
      }

      const { id } = req.params;
      const payment = await this.paymentService.findById(Number(id));

      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      if ((payment as any).payslip.employee.entrepriseId !== user.entrepriseId) {
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

  // 🔹 Générer et télécharger la liste des paiements PDF par période
  async generatePaymentList(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      if (user.role !== 'CAISSIER') {
        res.status(403).json({ message: "Access denied. Only cashiers can generate payment lists." });
        return;
      }

      const { startDate, endDate, entrepriseId } = req.query;
      const filters: any = {};

      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      if (entrepriseId) {
        filters.entrepriseId = parseInt(entrepriseId as string);
      } else {
        filters.entrepriseId = user.entrepriseId;
      }

      const payments = await this.paymentService.findAll(filters);

      if (!payments || payments.length === 0) {
        res.status(404).json({ message: "No payments found for the specified period" });
        return;
      }

      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date();

      const pdfBuffer = await this.pdfService.generatePaymentListPDF(payments as any, start, end);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payment-list-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}