import type { Request, Response } from "express";
import { EmployeeService } from "../service/EmployeeService.js";

const employeeService = new EmployeeService();

export class EmployeeController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const employee = await employeeService.create(req.body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};

      if (req.query.actif !== undefined) {
        filters.actif = req.query.actif === "true";
      }

      if (req.query.poste) {
        filters.poste = req.query.poste as string;
      }

      if (req.query.typeContrat) {
        filters.typeContrat = req.query.typeContrat as string;
      }

      if (req.query.entrepriseId) {
        filters.entrepriseId = Number(req.query.entrepriseId);
      }

      const employees = await employeeService.findAll(filters);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
}
