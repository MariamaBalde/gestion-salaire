import { EntrepriseRepository } from "../repository/EntrepriseRepository.js";
import type { Entreprise, TypePeriode } from "@prisma/client";

interface EntrepriseCreateInput {
  nom: string;
  adresse: string;
  devise: string;
  typePeriode: TypePeriode;
  logo: string | null;
  createdById: number | null;
}

interface EntrepriseUpdateInput {
  nom?: string;
  adresse?: string;
  devise?: string;
  typePeriode?: TypePeriode;
  logo?: string | null;
}

export class EntrepriseService {
  private entrepriseRepository = new EntrepriseRepository();

  // 🔹 Création d’une entreprise
  async create(data: EntrepriseCreateInput): Promise<Entreprise> {
    return this.entrepriseRepository.create({
      ...data,
      devise: data.devise || "XOF",
      typePeriode: data.typePeriode || "MENSUELLE",
      logo: data.logo || null,
    });
  }

  async findById(id: number): Promise<Entreprise | null> {
    return this.entrepriseRepository.findById(id);
  }

  async findAll(filters?: {
    nom?: string;
    createdById?: number;
    id?: number;
  }): Promise<Entreprise[]> {
    console.log('EntrepriseService - findAll - filters:', filters);
    const result = await this.entrepriseRepository.findAll(filters);
    console.log('EntrepriseService - findAll - result:', result);
    return result;
  }

  async update(id: number, data: EntrepriseUpdateInput): Promise<Entreprise> {
    const updateData = { ...data };
    
    // Validate and clean up data
    if (updateData.logo === undefined) {
      delete updateData.logo;
    }

    return this.entrepriseRepository.update(id, updateData);
  }

  async delete(id: number): Promise<Entreprise> {
    return this.entrepriseRepository.delete(id);
  }
}