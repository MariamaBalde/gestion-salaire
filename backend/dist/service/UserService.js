import { UserRepository } from "../repository/UserRepository.js";
import bcrypt from "bcryptjs";
export class UserService {
    userRepository = new UserRepository();
    async findAll() {
        return this.userRepository.findAll();
    }
    async create(data) {
        const userexiste = await this.userRepository.findByEmail(data.email);
        if (userexiste) {
            throw new Error("L utilisateur avec cet email existe deja");
        }
        const passwordHashe = await bcrypt.hash(data.motDePasse, 10);
        const userCreer = {
            nom: data.nom,
            email: data.email,
            motDePasse: passwordHashe,
            role: data.role,
            actif: true,
            entrepriseId: data.entrepriseId || null
        };
        return this.userRepository.create(userCreer);
    }
}
//# sourceMappingURL=UserService.js.map