import type { Request, Response } from "express";
import { EmployeeService } from "../service/EmployeeService.js";
import { PDFService } from "../service/PDFService.js";

const employeeService = new EmployeeService();
const pdfService = new PDFService();

export class EmployeeController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const body = { ...req.body };

      if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        if (!body.entrepriseId) {
          body.entrepriseId = user.entrepriseId;
        }
      }
      // For SUPER_ADMIN, entrepriseId should be provided in body

      const employee = await employeeService.create(body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};
      const user = req.user as any;

      console.log('EmployeeController findAll - user role:', user.role);
      console.log('EmployeeController findAll - req.query:', req.query);

      // Handle entrepriseId filter
      if (req.query.entrepriseId) {
        filters.entrepriseId = parseInt(req.query.entrepriseId as string);
        console.log('EmployeeController findAll - SUPER_ADMIN with entrepriseId:', filters.entrepriseId);
      } else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        filters.entrepriseId = user.entrepriseId;
      }

      // Handle other filters
      if (req.query.actif !== undefined && req.query.actif !== '') {
        filters.actif = req.query.actif === 'true';
        console.log('EmployeeController findAll - actif filter:', filters.actif);
      }

      if (req.query.poste && req.query.poste !== '') {
        filters.poste = req.query.poste as string;
        console.log('EmployeeController findAll - poste filter:', filters.poste);
      }

      if (req.query.typeContrat && req.query.typeContrat !== '') {
        filters.typeContrat = req.query.typeContrat as string;
        console.log('EmployeeController findAll - typeContrat filter:', filters.typeContrat);
      }

      console.log('EmployeeController findAll - final filters:', filters);

      const employees = await employeeService.findAll(filters);
      res.json(employees);
    } catch (error: any) {
      console.error('Error in findAll:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const employee = await employeeService.findById(id);
      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      const user = req.user as any;
      if ((user.role === 'ADMIN' || user.role === 'CAISSIER') && employee.entrepriseId !== user.entrepriseId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const employee = await employeeService.update(id, req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await employeeService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const employee = await employeeService.toggleActive(id);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // 🔹 Générer et télécharger la liste d'émargement PDF par période
  async generateAttendanceList(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, entrepriseId } = req.query;
      const filters: any = {};
      const user = req.user as any;

      if (entrepriseId) {
        filters.entrepriseId = parseInt(entrepriseId as string);
      } else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
        filters.entrepriseId = user.entrepriseId;
      }

      // Get employees
      const employees = await employeeService.findAll(filters);

      if (!employees || employees.length === 0) {
        res.status(404).json({ message: "No employees found" });
        return;
      }

      // For now, create basic attendance data from employees
      // In a real system, this would come from a dedicated attendance/timesheet table
      const attendanceData = employees.map(employee => ({
        employee: {
          nomComplet: employee.nomComplet,
          poste: employee.poste
        },
        payRun: {
          dateDebut: startDate ? new Date(startDate as string) : new Date(),
          dateFin: endDate ? new Date(endDate as string) : new Date(),
          entreprise: { nom: 'Entreprise' } // This would come from entreprise data
        },
        status: employee.actif ? 'Actif' : 'Inactif'
      }));

      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date();

      const pdfBuffer = await pdfService.generateAttendanceListPDF(attendanceData, start, end);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-list-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
