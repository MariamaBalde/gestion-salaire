import { EmployeeService } from "../service/EmployeeService.js";
const employeeService = new EmployeeService();
export class EmployeeController {
    async create(req, res) {
        try {
            const employee = await employeeService.create(req.body);
            res.status(201).json(employee);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findAll(req, res) {
        try {
            const filters = {};
            if (req.query.actif !== undefined) {
                filters.actif = req.query.actif === "true";
            }
            if (req.query.poste) {
                filters.poste = req.query.poste;
            }
            if (req.query.typeContrat) {
                filters.typeContrat = req.query.typeContrat;
            }
            const user = req.user;
            if (user.role === 'SUPER_ADMIN') {
                if (req.query.entrepriseId) {
                    filters.entrepriseId = Number(req.query.entrepriseId);
                }
                else {
                    filters.entrepriseCreatedById = user.id;
                }
            }
            else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
                filters.entrepriseId = user.entrepriseId;
            }
            const employees = await employeeService.findAll(filters);
            res.json(employees);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async findById(req, res) {
        try {
            const id = Number(req.params.id);
            const employee = await employeeService.findById(id);
            if (!employee) {
                res.status(404).json({ error: "Employee not found" });
                return;
            }
            res.json(employee);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            const employee = await employeeService.update(id, req.body);
            res.json(employee);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const id = Number(req.params.id);
            await employeeService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async toggleActive(req, res) {
        try {
            const id = Number(req.params.id);
            const employee = await employeeService.toggleActive(id);
            res.json(employee);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
//# sourceMappingURL=EmployeeController.js.map