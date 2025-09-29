import { AuthService } from "../service/AuthService.js";
export class AuthController {
    authService = new AuthService();
    async login(req, res) {
        try {
            const { email, motDePasse } = req.body;
            const result = await this.authService.login(email, motDePasse);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
//# sourceMappingURL=AuthController.js.map