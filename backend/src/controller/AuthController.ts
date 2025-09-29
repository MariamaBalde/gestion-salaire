import type { Request, Response } from "express";

import { AuthService } from "../service/AuthService.js";

export class AuthController {
    private authService = new AuthService();

    async login(req: Request, res: Response) {
        try {
            const { email, motDePasse } = req.body;
            const result = await this.authService.login(email, motDePasse);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    }
}