import type { Request, Response } from "express";
import { AttendanceService } from "../service/AttendanceService.js";
import { PDFService } from "../service/PDFService.js";

export class AttendanceController {
  private attendanceService = new AttendanceService();
  private pdfService = new PDFService();

  // 🔹 Créer un pointage
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const result = await this.attendanceService.create(req.body, user.id);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      const user = req.user as any;

      if (req.query.employeeId) {
        filters.employeeId = parseInt(req.query.employeeId as string);
      }

      if (req.query.entrepriseId) {
        filters.entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        filters.entrepriseId = user.entrepriseId;
      }

      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }

      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      if (req.query.status) {
        filters.status = req.query.status as any;
      }

      const attendances = await this.attendanceService.findAll(filters);
      res.json(attendances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceService.findById(Number(id));

      if (!attendance) {
        res.status(404).json({ message: "Attendance not found" });
        return;
      }

      const user = req.user as any;
      if ((user.role === 'ADMIN' || user.role === 'CAISSIER') &&
          (attendance as any).employee.entrepriseId !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceService.update(Number(id), req.body);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.attendanceService.delete(Number(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Check-in pour un employé
  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.body;
      const user = req.user as any;

      if (!employeeId) {
        res.status(400).json({ message: "Employee ID is required" });
        return;
      }

      const attendance = await this.attendanceService.checkIn(employeeId, user.id);
      res.status(201).json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Check-out pour un employé
  async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.body;
      const user = req.user as any;

      if (!employeeId) {
        res.status(400).json({ message: "Employee ID is required" });
        return;
      }

      const attendance = await this.attendanceService.checkOut(employeeId);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Création en masse de pointages
  async bulkCreate(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const attendances = await this.attendanceService.bulkCreate(req.body, user.id);
      res.status(201).json(attendances);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Statistiques de pointage pour un employé
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, dateFrom, dateTo } = req.query;

      if (!employeeId || !dateFrom || !dateTo) {
        res.status(400).json({ message: "employeeId, dateFrom, and dateTo are required" });
        return;
      }

      const stats = await this.attendanceService.getAttendanceStats(
        parseInt(employeeId as string),
        new Date(dateFrom as string),
        new Date(dateTo as string)
      );

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Rapport mensuel de pointage
  async getMonthlyReport(req: Request, res: Response): Promise<void> {
    try {
      const { entrepriseId, year, month } = req.query;
      const user = req.user as any;

      const entrepriseIdNum = entrepriseId ? parseInt(entrepriseId as string) :
        (user.role === 'ADMIN' || user.role === 'CAISSIER') ? user.entrepriseId : null;

      if (!entrepriseIdNum || !year || !month) {
        res.status(400).json({ message: "entrepriseId, year, and month are required" });
        return;
      }

      const report = await this.attendanceService.getMonthlyReport(
        entrepriseIdNum,
        parseInt(year as string),
        parseInt(month as string)
      );

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Générer le rapport PDF de pointage mensuel
  async generateMonthlyReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { entrepriseId, year, month } = req.query;
      const user = req.user as any;

      const entrepriseIdNum = entrepriseId ? parseInt(entrepriseId as string) :
        (user.role === 'ADMIN' || user.role === 'CAISSIER') ? user.entrepriseId : null;

      if (!entrepriseIdNum || !year || !month) {
        res.status(400).json({ message: "entrepriseId, year, and month are required" });
        return;
      }

      const report = await this.attendanceService.getMonthlyReport(
        entrepriseIdNum,
        parseInt(year as string),
        parseInt(month as string)
      );

      const pdfBuffer = await this.pdfService.generateAttendanceReportPDF(report as any, parseInt(year as string), parseInt(month as string));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${year}-${month}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Gestion des pauses
  async startBreak(req: Request, res: Response): Promise<void> {
    try {
      const { attendanceId } = req.body;
      const user = req.user as any;

      if (!attendanceId) {
        res.status(400).json({ message: "Attendance ID is required" });
        return;
      }

      const attendance = await this.attendanceService.startBreak(attendanceId, user.id);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async endBreak(req: Request, res: Response): Promise<void> {
    try {
      const { attendanceId } = req.body;
      const user = req.user as any;

      if (!attendanceId) {
        res.status(400).json({ message: "Attendance ID is required" });
        return;
      }

      const attendance = await this.attendanceService.endBreak(attendanceId, user.id);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Workflow d'approbation
  async approveAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { justification } = req.body;
      const user = req.user as any;

      const attendance = await this.attendanceService.approveAttendance(parseInt(id), user.id, justification || undefined);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async rejectAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { justification } = req.body;
      const user = req.user as any;

      const attendance = await this.attendanceService.rejectAttendance(parseInt(id), user.id, justification || undefined);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async correctAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { correctionData, justification } = req.body;
      const user = req.user as any;

      const attendance = await this.attendanceService.correctAttendance(parseInt(id), correctionData, user.id, justification || '');
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Résumés journaliers
  async getDaySummaries(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, dateFrom, dateTo } = req.query;

      if (!employeeId || !dateFrom || !dateTo) {
        res.status(400).json({ message: "employeeId, dateFrom, and dateTo are required" });
        return;
      }

      const summaries = await this.attendanceService.getDaySummaries(
        parseInt(employeeId as string),
        new Date(dateFrom as string),
        new Date(dateTo as string)
      );

      res.json(summaries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Audit trail
  async getAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const auditTrail = await this.attendanceService.getAuditTrail(parseInt(id as string));
      res.json(auditTrail);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Recherche avancée avec filtres étendus
  async findAllWithFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      const user = req.user as any;

      if (req.query.employeeId) {
        filters.employeeId = parseInt(req.query.employeeId as string);
      }

      if (req.query.entrepriseId) {
        filters.entrepriseId = parseInt(req.query.entrepriseId as string);
      } else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        filters.entrepriseId = user.entrepriseId;
      }

      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }

      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      if (req.query.status) {
        filters.status = req.query.status as any;
      }

      if (req.query.approvalStatus) {
        filters.approvalStatus = req.query.approvalStatus as any;
      }

      if (req.query.createdById) {
        filters.createdById = parseInt(req.query.createdById as string);
      }

      const attendances = await this.attendanceService.findAllWithFilters(filters);
      res.json(attendances);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}