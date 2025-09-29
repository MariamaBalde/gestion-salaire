import { EmployeeRepository } from "../repository/EmployeeRepository.js";
export class EmployeeService {
    employeeRepository = new EmployeeRepository();
    async create(data) {
        return this.employeeRepository.create({
            nomComplet: data.nomComplet,
            poste: data.poste,
            typeContrat: data.typeContrat,
            tauxSalaire: data.tauxSalaire,
            coordonneesBancaires: data.coordonneesBancaires || null,
            entreprise: { connect: { id: data.entrepriseId } }
        });
    }
    async findById(id) {
        return this.employeeRepository.findById(id);
    }
    async findAll(filters) {
        return this.employeeRepository.findAll(filters);
    }
    async update(id, data) {
        const updateData = {};
        if (data.nomComplet)
            updateData.nomComplet = data.nomComplet;
        if (data.poste)
            updateData.poste = data.poste;
        if (data.typeContrat)
            updateData.typeContrat = data.typeContrat;
        if (data.tauxSalaire !== undefined)
            updateData.tauxSalaire = data.tauxSalaire;
        if (data.coordonneesBancaires !== undefined)
            updateData.coordonneesBancaires = data.coordonneesBancaires;
        return this.employeeRepository.update(id, updateData);
    }
    async delete(id) {
        return this.employeeRepository.delete(id);
    }
    async toggleActive(id) {
        return this.employeeRepository.toggleActive(id);
    }
}
//# sourceMappingURL=EmployeeService.js.map