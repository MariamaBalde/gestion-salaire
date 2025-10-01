import { EmployeeService } from "../service/EmployeeService.js";
const employeeService = new EmployeeService();
export class EmployeeController {
    async create(req, res) {
        try {
            const user = req.user;
            const body = { ...req.body };
            if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
                if (!body.entrepriseId) {
                    body.entrepriseId = user.entrepriseId;
                }
            }
            // For SUPER_ADMIN, entrepriseId should be provided in body
            const employee = await employeeService.create(body);
            res.status(201).json(employee);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findAll(req, res) {
        try {
            const filters = {};
            const user = req.user;
            console.log('EmployeeController findAll - user role:', user.role);
            console.log('EmployeeController findAll - req.query:', req.query);
            if (req.query.entrepriseId) {
                filters.entrepriseId = parseInt(req.query.entrepriseId);
                console.log('EmployeeController findAll - SUPER_ADMIN with entrepriseId:', filters.entrepriseId);
            }
            else if (user.role === 'ADMIN' || user.role === 'CAISSIER') {
                filters.entrepriseId = user.entrepriseId;
            }
            console.log('EmployeeController findAll - final filters:', filters);
            const employees = await employeeService.findAll(filters);
            res.json(employees);
        }
        catch (error) {
            console.error('Error in findAll:', error);
            res.status(500).json({ message: error.message });
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
            const user = req.user;
            if ((user.role === 'ADMIN' || user.role === 'CAISSIER') && employee.entrepriseId !== user.entrepriseId) {
                res.status(403).json({ message: "Access denied" });
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