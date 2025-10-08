import { ActivityRepository } from "../repository/ActivityRepository.js";

export class ActivityService {
  private activityRepository: ActivityRepository;

  constructor() {
    this.activityRepository = new ActivityRepository();
  }

  async findAll(filters?: any) {
    return await this.activityRepository.findAll(filters);
  }

  async findById(id: number) {
    return await this.activityRepository.findById(id);
  }

  async create(data: any) {
    return await this.activityRepository.create(data);
  }

  async update(id: number, data: any) {
    return await this.activityRepository.update(id, data);
  }

  async delete(id: number) {
    return await this.activityRepository.delete(id);
  }

  async findRecent(limit: number = 10) {
    return await this.activityRepository.findRecent(limit);
  }

  async logActivity(action: string, entityType: string, entityId?: number, entityName?: string, entrepriseId?: number, userId?: number, details?: any) {
    const activityData = {
      action,
      entityType,
      entityId,
      entityName,
      entrepriseId,
      userId,
      details: details ? JSON.stringify(details) : null
    };

    return await this.create(activityData);
  }
}