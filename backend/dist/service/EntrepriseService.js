import { EntrepriseRepository } from "../repository/EntrepriseRepository.js";
export class EntrepriseService {
    entrepriseRepository = new EntrepriseRepository();
    // 🔹 Création d’une entreprise
    async create(data) {
        return this.entrepriseRepository.create({
            ...data,
            devise: data.devise || "XOF",
            typePeriode: data.typePeriode || "MENSUELLE"
        });
    }
    async findById(id) {
        return this.entrepriseRepository.findById(id);
    }
    async findAll(filters) {
        return this.entrepriseRepository.findAll(filters);
    }
    async update(id, data) {
        return this.entrepriseRepository.update(id, data);
    }
    async delete(id) {
        return this.entrepriseRepository.delete(id);
    }
}
//# sourceMappingURL=EntrepriseService.js.map