import type { Payment } from '@prisma/client';
export declare class PDFService {
    generatePaymentReceipt(payment: Payment & {
        payslip: {
            employee: {
                nomComplet: string;
                poste: string;
            };
            payRun: {
                dateDebut: Date;
                dateFin: Date;
                entreprise: {
                    nom: string;
                    devise: string;
                };
            };
            brut: number;
            deductions: number;
            net: number;
            payments: {
                montant: number;
            }[];
        };
        createdBy?: {
            nom: string;
        };
    }): Promise<Buffer>;
    private formatPaymentMode;
}
//# sourceMappingURL=PDFService.d.ts.map