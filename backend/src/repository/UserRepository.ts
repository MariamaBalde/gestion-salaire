import { PrismaClient, type $Enums, type Utilisateur } from "@prisma/client";
import type { IRepository } from "./IRepository.js";

export class UserRepository implements IRepository<Utilisateur> {
  private getPrismaClient() {
    return new PrismaClient();
  }

  async findAll(): Promise<Utilisateur[]> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.findMany();
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async create(data: Omit<Utilisateur, "id">): Promise<Utilisateur> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.create({ data });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findByEmail(email: string): Promise<Utilisateur | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.findUnique({
        where: { email },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findByEntreprise(entrepriseId: number): Promise<Utilisateur[]> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.findMany({
        where: { entrepriseId },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findById(id: number): Promise<Utilisateur | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.findUnique({
        where: { id },
        include: { entreprise: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async update(id: number, data: Partial<Utilisateur>): Promise<Utilisateur> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.update({
        where: { id },
        data,
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async delete(id: number): Promise<Utilisateur> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.utilisateur.delete({
        where: { id },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }
}