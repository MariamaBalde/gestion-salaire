import type { Request, Response } from "express";

import { AuthService } from "../service/AuthService.js";
import { loginSchema } from "../validation/validation.ts";

export class AuthController {
    private authService = new AuthService();

    async login(req: Request, res: Response) {
        try {
                        console.log('Login attempt:', req.body);
            const validatedData = loginSchema.parse(req.body);
            const { email, motDePasse } = validatedData;
            const result = await this.authService.login(email, motDePasse);
             console.log('Login successful:', { ...result, motDePasse: undefined });

            res.json(result);
        } catch (err) {
                        console.error('Login error:', err);

            res.status(400).json({ error: (err as Error).message });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { nom, email, motDePasse, nomEntreprise, adresseEntreprise, role } = req.body;
            const result = await this.authService.register(nom, email, motDePasse, nomEntreprise, adresseEntreprise, role);
            res.json({ user: { ...result, motDePasse: undefined } });
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    }

}