import { EmployeeService } from "../service/EmployeeService.js";
export class EmployeeController {
    employeeService = new EmployeeService();
    async create(req, res) {
        try {
            const { nomComplet, poste, typeContrat, tauxSalaire, coordonneesBancaires, entrepriseId } = req.body;
            if (!nomComplet || !poste || !typeContrat || !tauxSalaire || !entrepriseId) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const employee = await this.employeeService.create({
                nomComplet,
                poste,
                typeContrat,
                tauxSalaire: parseFloat(tauxSalaire),
                coordonneesBancaires,
                entrepriseId: parseInt(entrepriseId)
            });
            res.status(201).json(employee);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async findAll(req, res) {
        try {
            const { actif, poste, typeContrat, entrepriseId } = req.query;
            const filters = {};
            if (actif !== undefined) {
                filters.actif = actif === 'true';
            }
            if (poste) {
                filters.poste = poste;
            }
            if (typeContrat) {
                filters.typeContrat = typeContrat;
            }
            if (entrepriseId) {
                filters.entrepriseId = parseInt(entrepriseId);
            }
            const employees = await this.employeeService.findAll(filters);
            res.json(employees);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ error: "ID required" });
            const employee = await this.employeeService.findById(parseInt(id));
            if (!employee) {
                return res.status(404).json({ error: "Employee not found" });
            }
            res.json(employee);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ error: "ID required" });
            const { nomComplet, poste, typeContrat, tauxSalaire, coordonneesBancaires } = req.body;
            const updateData = {};
            if (nomComplet)
                updateData.nomComplet = nomComplet;
            if (poste)
                updateData.poste = poste;
            if (typeContrat)
                updateData.typeContrat = typeContrat;
            if (tauxSalaire !== undefined)
                updateData.tauxSalaire = parseFloat(tauxSalaire);
            if (coordonneesBancaires !== undefined)
                updateData.coordonneesBancaires = coordonneesBancaires;
            const employee = await this.employeeService.update(parseInt(id), updateData);
            res.json(employee);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ error: "ID required" });
            await this.employeeService.delete(parseInt(id));
            res.status(204).send();
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async toggleActive(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ error: "ID required" });
            const employee = await this.employeeService.toggleActive(parseInt(id));
            res.json(employee);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
//# sourceMappingURL=EmployeeController.js.map