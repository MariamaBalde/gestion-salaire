import { EmployeeRepository } from "../repository/EmployeeRepository.js";
export class EmployeeService {
    employeeRepository = new EmployeeRepository();
    async create(data) {
        return this.employeeRepository.create({
            ...data,
            actif: data.actif ?? true,
        });
    }
    async findById(id) {
        return this.employeeRepository.findById(id);
    }
    async findAll(filters) {
        return this.employeeRepository.findAll(filters);
    }
    async update(id, data) {
        return this.employeeRepository.update(id, data);
    }
    async delete(id) {
        return this.employeeRepository.delete(id);
    }
    async toggleActive(id) {
        return this.employeeRepository.toggleActive(id);
    }
}
//# sourceMappingURL=EmployeeService.js.map