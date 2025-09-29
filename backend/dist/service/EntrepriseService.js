import { EntrepriseRepository } from "../repository/EntrepriseRepository.js";
export class EntrepriseService {
    entrepriseRepository = new EntrepriseRepository();
    async create(data) {
        return this.entrepriseRepository.create(data);
    }
    async findById(id) {
        return this.entrepriseRepository.findById(id);
    }
    async findAll() {
        return this.entrepriseRepository.findAll();
    }
}
//# sourceMappingURL=EntrepriseService.js.map