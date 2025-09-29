import { EntrepriseRepository } from "../repository/EntrepriseRepository.js";
import type { Entreprise } from "@prisma/client";

export class EntrepriseService {
  private entrepriseRepository = new EntrepriseRepository();

  async create(data: {
    nom: string;
    logo?: string;
    adresse: string;
    devise?: string;
    typePeriode?: string;
  }): Promise<Entreprise> {
    return this.entrepriseRepository.create(data);
  }

  async findById(id: number): Promise<Entreprise | null> {
    return this.entrepriseRepository.findById(id);
  }

  async findAll(): Promise<Entreprise[]> {
    return this.entrepriseRepository.findAll();
  }
}