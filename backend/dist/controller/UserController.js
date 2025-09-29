import { UserService } from "../service/UserService.js";
export class UserController {
    userService = new UserService();
    async Inscription(req, res) {
        try {
            const { nom, email, motDePasse, role } = req.body;
            const utilisateur = await this.userService.create({
                nom,
                email,
                motDePasse,
                role
            });
            res.status(201).json({
                message: "Utilisateur créé avec succès",
                utilisateur,
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const utilisateurs = await this.userService.findAll();
            res.json(utilisateurs);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=UserController.js.map