import { EntrepriseService } from "../service/EntrepriseService.js";
import { entrepriseSchema } from "../validation/validation.js";
export class EntrepriseController {
    entrepriseService = new EntrepriseService();
    // 🔹 Créer une entreprise
    async create(req, res) {
        try {
            const validatedData = entrepriseSchema.parse(req.body);
            const entreprise = await this.entrepriseService.create(validatedData, req.user.id);
            res.status(201).json(entreprise);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async findAll(req, res) {
        try {
            const { nom } = req.query;
            const filters = {};
            if (nom) {
                filters.nom = nom;
            }
            const user = req.user;
            if (user.role === 'ADMIN') {
                filters.id = user.entrepriseId;
            }
            // SUPER_ADMIN sees all enterprises without filter
            const entreprises = await this.entrepriseService.findAll(filters);
            res.json(entreprises);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async findById(req, res) {
        try {
            console.log('Finding enterprise by id:', req.params.id);
            const { id } = req.params;
            const entreprise = await this.entrepriseService.findById(Number(id));
            if (!entreprise) {
                console.log('Enterprise not found');
                res.status(404).json({ message: "Entreprise not found" });
                return;
            }
            const user = req.user;
            if (user.role === 'ADMIN' && entreprise.id !== user.entrepriseId) {
                res.status(403).json({ message: "Access denied" });
                return;
            }
            console.log('Enterprise found:', entreprise);
            res.json(entreprise);
        }
        catch (error) {
            console.error('Error finding enterprise:', error);
            res.status(400).json({ message: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const entreprise = await this.entrepriseService.update(Number(id), req.body);
            res.json(entreprise);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.entrepriseService.delete(Number(id));
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=EntrepriseController.js.map