import { AuthService } from "../service/AuthService.js";
import { loginSchema } from "../validation/validation.js";
export class AuthController {
    authService = new AuthService();
    async login(req, res) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const { email, motDePasse } = validatedData;
            const result = await this.authService.login(email, motDePasse);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
//# sourceMappingURL=AuthController.js.map