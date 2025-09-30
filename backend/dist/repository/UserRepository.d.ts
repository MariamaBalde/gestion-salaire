import { type Utilisateur } from "@prisma/client";
import type { IRepository } from "./IRepository.js";
export declare class UserRepository implements IRepository<Utilisateur> {
    findAll(): Promise<Utilisateur[]>;
    create(data: Omit<Utilisateur, "id">): Promise<Utilisateur>;
    findByEmail(email: string): Promise<Utilisateur | null>;
    findByEntreprise(entrepriseId: number): Promise<Utilisateur[]>;
    update(id: number, data: Partial<Utilisateur>): Promise<Utilisateur>;
    delete(id: number): Promise<Utilisateur>;
}
//# sourceMappingURL=UserRepository.d.ts.map