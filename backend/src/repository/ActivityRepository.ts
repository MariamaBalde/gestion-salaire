import { PrismaClient } from "@prisma/client";
import type { IRepository } from "./IRepository.js";

export class ActivityRepository implements IRepository<any> {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(filters?: any): Promise<any[]> {
    try {
      const activities = await this.prisma.activity.findMany({
        where: filters,
        include: {
          entreprise: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });
      return activities;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findById(id: number): Promise<any | null> {
    try {
      const activity = await this.prisma.activity.findUnique({
        where: { id },
        include: {
          entreprise: true,
          user: true
        }
      });
      return activity;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async create(data: any): Promise<any> {
    try {
      const activity = await this.prisma.activity.create({
        data,
        include: {
          entreprise: true,
          user: true
        }
      });
      return activity;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async update(id: number, data: any): Promise<any> {
    try {
      const activity = await this.prisma.activity.update({
        where: { id },
        data,
        include: {
          entreprise: true,
          user: true
        }
      });
      return activity;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.activity.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async findRecent(limit: number = 10): Promise<any[]> {
    try {
      const activities = await this.prisma.activity.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          entreprise: true,
          user: true
        }
      });
      return activities;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}