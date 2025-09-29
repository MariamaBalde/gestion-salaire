import type { Utilisateur, Prisma } from "@prisma/client";
import { UserRepository } from "../repository/UserRepository.js";
import bcrypt from "bcryptjs";

export class UserService {
  private userRepository = new UserRepository();

  async findAll(): Promise<Utilisateur[]> {
    return this.userRepository.findAll();
  }

  async create(data: {
    nom: string;
    email: string;
    motDePasse: string;
    role: string;
    entrepriseId?: number;
  }): Promise<Utilisateur> {
    console.log("Creating user with data:", data);
    const userexiste = await this.userRepository.findByEmail(data.email);
    if (userexiste) {
        throw new Error ("L utilisateur avec cet email existe deja");
    }
    const passwordHashe = await bcrypt.hash(data.motDePasse, 10);
    const userCreer = {
        nom: data.nom,
        email: data.email,
        motDePasse: passwordHashe,
        role: data.role as any,
        actif: true,
        entrepriseId: data.entrepriseId || null
    } as Omit<Utilisateur, "id">
    console.log("User data to create:", userCreer);
    const result = await this.userRepository.create(userCreer);
    console.log("User created successfully:", result);
    return result;
  }
}
