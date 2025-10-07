import PDFDocument from 'pdfkit';
import type { Payment } from '@prisma/client';

export class PDFService {
  // 🔹 Générer un reçu PDF pour un paiement
  async generatePaymentReceipt(payment: Payment & {
    payslip: {
      employee: { nomComplet: string; poste: string };
      payRun: { dateDebut: Date; dateFin: Date; entreprise: { nom: string; devise: string } };
      brut: number;
      deductions: number;
      net: number;
      payments: { montant: number }[];
    };
    createdBy?: { nom: string };
  }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête
      doc.fontSize(20).text('REÇU DE PAIEMENT', { align: 'center' });
      doc.moveDown();

      // Informations de l'entreprise
      doc.fontSize(12).text(`Entreprise: ${payment.payslip.payRun.entreprise.nom}`, { align: 'left' });
      doc.text(`Période: ${payment.payslip.payRun.dateDebut.toLocaleDateString()} - ${payment.payslip.payRun.dateFin.toLocaleDateString()}`);
      doc.moveDown();

      // Informations de l'employé
      doc.text(`Employé: ${payment.payslip.employee.nomComplet}`);
      doc.text(`Poste: ${payment.payslip.employee.poste}`);
      doc.moveDown();

      // Détails du paiement
      doc.text(`Montant payé: ${payment.montant} ${payment.payslip.payRun.entreprise.devise}`);
      doc.text(`Mode de paiement: ${this.formatPaymentMode(payment.modePaiement)}`);
      if (payment.reference) {
        doc.text(`Référence: ${payment.reference}`);
      }
      doc.text(`Date du paiement: ${payment.date.toLocaleDateString()}`);
      doc.moveDown();

      // Résumé du bulletin
      doc.text('Résumé du bulletin de paie:');
      doc.text(`Salaire brut: ${payment.payslip.brut} ${payment.payslip.payRun.entreprise.devise}`);
      doc.text(`Déductions: ${payment.payslip.deductions} ${payment.payslip.payRun.entreprise.devise}`);
      doc.text(`Salaire net: ${payment.payslip.net} ${payment.payslip.payRun.entreprise.devise}`);

      // Calculer le solde restant
      const totalPaid = payment.payslip.payments?.reduce((sum, p) => sum + p.montant, 0) || 0;
      const remaining = payment.payslip.net - totalPaid;
      doc.text(`Solde restant: ${remaining} ${payment.payslip.payRun.entreprise.devise}`);
      doc.moveDown();

      // Signature
      if (payment.createdBy) {
        doc.text(`Paiement enregistré par: ${payment.createdBy.nom}`);
      }
      doc.text(`Date d'émission: ${new Date().toLocaleDateString()}`);

      doc.end();
    });
  }

  // 🔹 Générer un bulletin de paie PDF
  async generatePayslipPDF(payslip: {
    id: number;
    employee: { nomComplet: string; poste: string };
    payRun: {
      dateDebut: Date;
      dateFin: Date;
      entreprise: { nom: string; adresse: string; devise: string }
    };
    joursTravailles?: number;
    brut: number;
    deductions: number;
    net: number;
    payments: { montant: number; date: Date; modePaiement: string }[];
  }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête
      doc.fontSize(20).text('BULLETIN DE PAIE', { align: 'center' });
      doc.moveDown();

      // Informations de l'entreprise
      doc.fontSize(12).text(`Entreprise: ${payslip.payRun.entreprise.nom}`, { align: 'left' });
      doc.text(`Adresse: ${payslip.payRun.entreprise.adresse}`);
      doc.text(`Période: ${payslip.payRun.dateDebut.toLocaleDateString()} - ${payslip.payRun.dateFin.toLocaleDateString()}`);
      doc.moveDown();

      // Informations de l'employé
      doc.text(`Employé: ${payslip.employee.nomComplet}`);
      doc.text(`Poste: ${payslip.employee.poste}`);
      if (payslip.joursTravailles) {
        doc.text(`Jours travaillés: ${payslip.joursTravailles}`);
      }
      doc.moveDown();

      // Détails du salaire
      doc.fontSize(14).text('Détails du salaire:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Salaire brut: ${payslip.brut} ${payslip.payRun.entreprise.devise}`);
      doc.text(`Déductions: ${payslip.deductions} ${payslip.payRun.entreprise.devise}`);
      doc.text(`Salaire net: ${payslip.net} ${payslip.payRun.entreprise.devise}`);
      doc.moveDown();

      // Historique des paiements
      if (payslip.payments && payslip.payments.length > 0) {
        doc.fontSize(14).text('Historique des paiements:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);

        payslip.payments.forEach((payment, index) => {
          doc.text(`${index + 1}. ${payment.date.toLocaleDateString()} - ${payment.montant} ${payslip.payRun.entreprise.devise} (${this.formatPaymentMode(payment.modePaiement)})`);
        });

        const totalPaid = payslip.payments.reduce((sum, p) => sum + p.montant, 0);
        const remaining = payslip.net - totalPaid;
        doc.moveDown();
        doc.text(`Total payé: ${totalPaid} ${payslip.payRun.entreprise.devise}`);
        doc.text(`Solde restant: ${remaining} ${payslip.payRun.entreprise.devise}`);
      }

      doc.moveDown(2);
      doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`);

      doc.end();
    });
  }

  // 🔹 Générer un PDF avec plusieurs bulletins de paie
  async generateBulkPayslipPDF(payslips: Array<{
    id: number;
    employee: { nomComplet: string; poste: string };
    payRun: {
      dateDebut: Date;
      dateFin: Date;
      entreprise: { nom: string; adresse: string; devise: string }
    };
    joursTravailles?: number;
    brut: number;
    deductions: number;
    net: number;
    payments: { montant: number; date: Date; modePaiement: string }[];
  }>): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête du document
      doc.fontSize(20).text('BULLETINS DE PAIE - LOT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Nombre de bulletins: ${payslips.length}`);
      doc.text(`Généré le: ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`);
      doc.moveDown(2);

      payslips.forEach((payslip, index) => {
        if (index > 0) {
          doc.addPage(); // Nouvelle page pour chaque bulletin
        }

        // En-tête du bulletin
        doc.fontSize(16).text(`BULLETIN DE PAIE #${payslip.id}`, { align: 'center' });
        doc.moveDown();

        // Informations de l'entreprise
        doc.fontSize(12).text(`Entreprise: ${payslip.payRun.entreprise.nom}`, { align: 'left' });
        doc.text(`Adresse: ${payslip.payRun.entreprise.adresse}`);
        doc.text(`Période: ${payslip.payRun.dateDebut.toLocaleDateString()} - ${payslip.payRun.dateFin.toLocaleDateString()}`);
        doc.moveDown();

        // Informations de l'employé
        doc.text(`Employé: ${payslip.employee.nomComplet}`);
        doc.text(`Poste: ${payslip.employee.poste}`);
        if (payslip.joursTravailles) {
          doc.text(`Jours travaillés: ${payslip.joursTravailles}`);
        }
        doc.moveDown();

        // Détails du salaire
        doc.fontSize(14).text('Détails du salaire:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Salaire brut: ${payslip.brut} ${payslip.payRun.entreprise.devise}`);
        doc.text(`Déductions: ${payslip.deductions} ${payslip.payRun.entreprise.devise}`);
        doc.text(`Salaire net: ${payslip.net} ${payslip.payRun.entreprise.devise}`);
        doc.moveDown();

        // Historique des paiements
        if (payslip.payments && payslip.payments.length > 0) {
          doc.fontSize(14).text('Historique des paiements:', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(12);

          payslip.payments.forEach((payment, paymentIndex) => {
            doc.text(`${paymentIndex + 1}. ${payment.date.toLocaleDateString()} - ${payment.montant} ${payslip.payRun.entreprise.devise} (${this.formatPaymentMode(payment.modePaiement)})`);
          });

          const totalPaid = payslip.payments.reduce((sum, p) => sum + p.montant, 0);
          const remaining = payslip.net - totalPaid;
          doc.moveDown();
          doc.text(`Total payé: ${totalPaid} ${payslip.payRun.entreprise.devise}`);
          doc.text(`Solde restant: ${remaining} ${payslip.payRun.entreprise.devise}`);
        }

        doc.moveDown(2);
      });

      doc.end();
    });
  }

  // 🔹 Générer une liste des paiements PDF par période
  async generatePaymentListPDF(payments: Array<{
    id: number;
    montant: number;
    modePaiement: string;
    date: Date;
    reference?: string;
    payslip: {
      employee: { nomComplet: string; poste: string };
      payRun: { entreprise: { nom: string; devise: string } };
    };
    createdBy?: { nom: string };
  }>, startDate: Date, endDate: Date): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête
      doc.fontSize(20).text('LISTE DES PAIEMENTS', { align: 'center' });
      doc.moveDown();

      // Période
      doc.fontSize(12).text(`Période: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
      doc.text(`Nombre de paiements: ${payments.length}`);
      doc.moveDown();

      // Calculer le total
      const totalAmount = payments.reduce((sum, payment) => sum + payment.montant, 0);
      doc.text(`Montant total: ${totalAmount} ${payments[0]?.payslip.payRun.entreprise.devise || 'XOF'}`);
      doc.moveDown(2);

      // En-têtes du tableau
      doc.fontSize(10);
      const tableTop = doc.y;
      const colWidths = [60, 100, 80, 80, 80, 80];

      doc.text('Date', 50, tableTop);
      doc.text('Employé', 110, tableTop);
      doc.text('Poste', 210, tableTop);
      doc.text('Montant', 290, tableTop);
      doc.text('Mode', 370, tableTop);
      doc.text('Référence', 450, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.moveDown(2);

      // Données du tableau
      let yPosition = doc.y;
      payments.forEach((payment) => {
        if (yPosition > 700) { // Nouvelle page si nécessaire
          doc.addPage();
          yPosition = 50;
        }

        doc.text(payment.date.toLocaleDateString(), 50, yPosition);
        doc.text(payment.payslip.employee.nomComplet, 110, yPosition);
        doc.text(payment.payslip.employee.poste, 210, yPosition);
        doc.text(`${payment.montant} ${payment.payslip.payRun.entreprise.devise}`, 290, yPosition);
        doc.text(this.formatPaymentMode(payment.modePaiement), 370, yPosition);
        doc.text(payment.reference || '-', 450, yPosition);

        yPosition += 20;
      });

      doc.moveDown(2);
      doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`);

      doc.end();
    });
  }

  // 🔹 Générer une liste d'émargement (présences) PDF par période
  async generateAttendanceListPDF(attendanceData: Array<{
    employee: { nomComplet: string; poste: string };
    payRun: { dateDebut: Date; dateFin: Date; entreprise: { nom: string } };
    joursTravailles?: number;
    status: string;
  }>, startDate: Date, endDate: Date): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête
      doc.fontSize(20).text('LISTE D\'ÉMARGEMENT', { align: 'center' });
      doc.moveDown();

      // Période
      doc.fontSize(12).text(`Période: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
      doc.text(`Nombre d'employés: ${attendanceData.length}`);
      doc.moveDown();

      // Instructions
      doc.fontSize(10).text('Instructions: Cocher la case correspondante pour chaque jour travaillé.');
      doc.moveDown();

      // En-têtes du tableau
      doc.fontSize(10);
      const colWidths = [80, 100, 80, 80, 80, 80];

      doc.text('Employé', 50, doc.y);
      doc.text('Poste', 130, doc.y);
      doc.text('Jours travaillés', 230, doc.y);
      doc.text('Statut', 310, doc.y);
      doc.text('Signature', 390, doc.y);
      doc.text('Date', 470, doc.y);

      doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
      doc.moveDown(2);

      // Données du tableau
      let yPosition = doc.y;
      attendanceData.forEach((item) => {
        if (yPosition > 700) { // Nouvelle page si nécessaire
          doc.addPage();
          yPosition = 50;
        }

        doc.text(item.employee.nomComplet, 50, yPosition);
        doc.text(item.employee.poste, 130, yPosition);
        doc.text(item.joursTravailles?.toString() || 'N/A', 230, yPosition);
        doc.text(item.status, 310, yPosition);

        // Cases à cocher pour signature
        doc.rect(390, yPosition - 5, 15, 15).stroke();
        doc.rect(470, yPosition - 5, 60, 15).stroke();

        yPosition += 25;
      });

      doc.moveDown(2);
      doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`);
      doc.moveDown();
      doc.text('Responsable RH: ___________________________ Date: _______________');

      doc.end();
    });
  }

  // 🔹 Générer une facture pro PDF
  async generateProfessionalInvoicePDF(invoiceData: {
    invoiceNumber: string;
    date: Date;
    dueDate: Date;
    client: {
      name: string;
      address: string;
      email?: string;
    };
    entreprise: {
      nom: string;
      adresse: string;
      devise: string;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string;
  }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête
      doc.fontSize(24).text('FACTURE', { align: 'center' });
      doc.moveDown();

      // Informations de la facture
      doc.fontSize(12);
      doc.text(`Numéro de facture: ${invoiceData.invoiceNumber}`, 50, doc.y);
      doc.text(`Date: ${invoiceData.date.toLocaleDateString()}`, 350, doc.y);
      doc.moveDown();
      doc.text(`Date d'échéance: ${invoiceData.dueDate.toLocaleDateString()}`, 50, doc.y);
      doc.moveDown(2);

      // Informations entreprise et client
      doc.text(`De: ${invoiceData.entreprise.nom}`, 50, doc.y);
      doc.text(`À: ${invoiceData.client.name}`, 350, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(invoiceData.entreprise.adresse, 50, doc.y);
      doc.text(invoiceData.client.address, 350, doc.y);
      if (invoiceData.client.email) {
        doc.moveDown(0.5);
        doc.text('', 350, doc.y);
        doc.text(invoiceData.client.email, 350, doc.y);
      }
      doc.moveDown(2);

      // Tableau des articles
      doc.fontSize(12);
      const tableTop = doc.y;
      const colWidths = [200, 80, 100, 100];

      doc.text('Description', 50, tableTop);
      doc.text('Qté', 250, tableTop);
      doc.text('Prix unit.', 330, tableTop);
      doc.text('Total', 430, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.moveDown(2);

      let yPosition = doc.y;
      invoiceData.items.forEach((item) => {
        if (yPosition > 650) {
          doc.addPage();
          yPosition = 50;
        }

        doc.text(item.description, 50, yPosition, { width: 190 });
        doc.text(item.quantity.toString(), 250, yPosition);
        doc.text(`${item.unitPrice} ${invoiceData.entreprise.devise}`, 330, yPosition);
        doc.text(`${item.total} ${invoiceData.entreprise.devise}`, 430, yPosition);

        yPosition += 30;
      });

      doc.moveDown(2);

      // Totaux
      const totalsX = 350;
      doc.text(`Sous-total: ${invoiceData.subtotal} ${invoiceData.entreprise.devise}`, totalsX, doc.y);
      doc.moveDown(0.5);
      doc.text(`TVA (${invoiceData.taxRate}%): ${invoiceData.taxAmount} ${invoiceData.entreprise.devise}`, totalsX, doc.y);
      doc.moveDown(0.5);
      doc.fontSize(14).text(`Total: ${invoiceData.total} ${invoiceData.entreprise.devise}`, totalsX, doc.y);

      // Notes
      if (invoiceData.notes) {
        doc.moveDown(2);
        doc.fontSize(10).text('Notes:', 50, doc.y);
        doc.moveDown(0.5);
        doc.text(invoiceData.notes, 50, doc.y, { width: 400 });
      }

      doc.moveDown(2);
      doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`);

      doc.end();
    });
  }

  private formatPaymentMode(mode: string): string {
    const modes: { [key: string]: string } = {
      ESPECES: 'Espèces',
      VIREMENT_BANCAIRE: 'Virement bancaire',
      ORANGE_MONEY: 'Orange Money',
      WAVE: 'Wave'
    };
    return modes[mode] || mode;
  }
}