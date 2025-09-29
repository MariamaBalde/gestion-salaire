import { AuthRepository } from "../repository/authRepository.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const JWT_SECRET = process.env.JWT_SECRET || "secret";
export class AuthService {
    authRepository = new AuthRepository();
    async login(email, motDePasse) {
        const user = await this.authRepository.login(email, motDePasse);
        if (!user)
            throw new Error("User not found");
        const match = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!match)
            throw new Error("Invalid credentials");
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        return { token, user };
    }
}
//# sourceMappingURL=AuthService.js.map