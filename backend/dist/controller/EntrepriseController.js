import { EntrepriseService } from "../service/EntrepriseService.js";
export class EntrepriseController {
    entrepriseService = new EntrepriseService();
    async create(req, res) {
        try {
            const { nom, logo, adresse, devise, typePeriode } = req.body;
            if (!nom || !adresse) {
                return res.status(400).json({ error: "Nom and adresse are required" });
            }
            const entreprise = await this.entrepriseService.create({
                nom,
                logo,
                adresse,
                devise,
                typePeriode
            });
            res.status(201).json(entreprise);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async findAll(req, res) {
        try {
            const entreprises = await this.entrepriseService.findAll();
            res.json(entreprises);
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
            const entreprise = await this.entrepriseService.findById(parseInt(id));
            if (!entreprise) {
                return res.status(404).json({ error: "Entreprise not found" });
            }
            res.json(entreprise);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
//# sourceMappingURL=EntrepriseController.js.map