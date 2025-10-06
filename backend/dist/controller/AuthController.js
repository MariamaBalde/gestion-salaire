import { AuthService } from "../service/AuthService.js";
import { loginSchema } from "../validation/validation.js";
export class AuthController {
    authService = new AuthService();
    async login(req, res) {
        try {
            console.log('Login attempt:', req.body);
            const validatedData = loginSchema.parse(req.body);
            const { email, motDePasse } = validatedData;
            const result = await this.authService.login(email, motDePasse);
            console.log('Login successful:', { ...result, motDePasse: undefined });
            res.json(result);
        }
        catch (err) {
            console.error('Login error:', err);
            res.status(400).json({ error: err.message });
        }
    }
}
//# sourceMappingURL=AuthController.js.map