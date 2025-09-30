import { UserRepository } from "../repository/UserRepository.js";
import bcrypt from "bcryptjs";
export class UserService {
    userRepository = new UserRepository();
    async findAll() {
        const users = await this.userRepository.findAll();
        // For each user, fetch with entreprise if entrepriseId exists
        return Promise.all(users.map(async (user) => {
            if (user.entrepriseId) {
                return await this.userRepository.findById(user.id) || user;
            }
            return user;
        }));
    }
    async findByEntreprise(entrepriseId) {
        return this.userRepository.findByEntreprise(entrepriseId);
    }
    async create(data) {
        console.log("Creating user with data:", data);
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
        console.log("User data to create:", userCreer);
        const result = await this.userRepository.create(userCreer);
        console.log("User created successfully:", result);
        // Fetch the created user with entreprise included
        const userWithEntreprise = await this.userRepository.findById(result.id);
        return userWithEntreprise || result;
    }
    async update(id, data) {
        return this.userRepository.update(id, data);
    }
    async delete(id) {
        return this.userRepository.delete(id);
    }
}
//# sourceMappingURL=UserService.js.map