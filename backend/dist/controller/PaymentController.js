import { PaymentService } from "../service/PaymentService.js";
import { PDFService } from "../service/PDFService.js";
export class PaymentController {
    paymentService = new PaymentService();
    pdfService = new PDFService();
    // 🔹 Créer un paiement
    async create(req, res) {
        try {
            const user = req.user;
            const result = await this.paymentService.create(req.body, user.id);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async findAll(req, res) {
        try {
            const filters = {};
            const user = req.user;
            if (req.query.payslipId) {
                filters.payslipId = parseInt(req.query.payslipId);
            }
            if (req.query.entrepriseId) {
                filters.entrepriseId = parseInt(req.query.entrepriseId);
            }
            else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
                filters.entrepriseId = user.entrepriseId;
            }
            // SUPER_ADMIN voit tous
            const payments = await this.paymentService.findAll(filters);
            res.json(payments);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const payment = await this.paymentService.findById(Number(id));
            if (!payment) {
                res.status(404).json({ message: "Payment not found" });
                return;
            }
            const user = req.user;
            if ((user.role === 'ADMIN' || user.role === 'CAISSIER') &&
                payment.payslip.employee.entrepriseId !== user.entrepriseId) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
            res.json(payment);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const payment = await this.paymentService.update(Number(id), req.body);
            res.json(payment);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.paymentService.delete(Number(id));
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // 🔹 Générer et télécharger le reçu PDF
    async generateReceipt(req, res) {
        try {
            const { id } = req.params;
            const payment = await this.paymentService.findById(Number(id));
            if (!payment) {
                res.status(404).json({ message: "Payment not found" });
                return;
            }
            const user = req.user;
            if ((user.role === 'ADMIN' || user.role === 'CAISSIER') &&
                payment.payslip.employee.entrepriseId !== user.entrepriseId) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
            const pdfBuffer = await this.pdfService.generatePaymentReceipt(payment);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=PaymentController.js.map