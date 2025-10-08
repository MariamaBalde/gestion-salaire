import type { Request, Response } from "express";
import { ActivityService } from "../service/ActivityService.js";

export class ActivityController {
  private activityService: ActivityService;

  constructor() {
    this.activityService = new ActivityService();
  }

  async findAll(req: Request, res: Response) {
    try {
      const filters = req.query;
      const activities = await this.activityService.findAll(filters);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const activity = await this.activityService.findById(id);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const activity = await this.activityService.create(req.body);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const activity = await this.activityService.update(id, req.body);
      res.json(activity);
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ error: "Failed to update activity" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      await this.activityService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ error: "Failed to delete activity" });
    }
  }

  async findRecent(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await this.activityService.findRecent(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  }
}