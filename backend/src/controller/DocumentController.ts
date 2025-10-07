import type { Request, Response } from "express";
import { PDFService } from "../service/PDFService.js";

const pdfService = new PDFService();

export class DocumentController {
  // 🔹 Générer une facture professionnelle PDF
  async generateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const invoiceData = req.body;

      // Validation basique
      if (!invoiceData.invoiceNumber || !invoiceData.client || !invoiceData.items) {
        res.status(400).json({ message: "Données de facture incomplètes" });
        return;
      }

      const pdfBuffer = await pdfService.generateProfessionalInvoicePDF(invoiceData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceData.invoiceNumber}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}