import { PrismaClient, type Entreprise } from "@prisma/client";

const prismaClient = new PrismaClient();

export class EntrepriseRepository {
  async create(data: {
    nom: string;
    logo?: string;
    adresse: string;
    devise?: string;
    typePeriode?: string;
  }): Promise<Entreprise> {
    return prismaClient.entreprise.create({
      data: {
        nom: data.nom,
        logo: data.logo || null,
        adresse: data.adresse,
        devise: data.devise || "XOF",
        typePeriode: data.typePeriode as any || "MENSUELLE"
      }
    });
  }

  async findById(id: number): Promise<Entreprise | null> {
    return prismaClient.entreprise.findUnique({
      where: { id }
    });
  }

  async findAll(): Promise<Entreprise[]> {
    return prismaClient.entreprise.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}