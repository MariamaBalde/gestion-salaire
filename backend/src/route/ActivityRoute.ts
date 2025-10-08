import { Router } from "express";
import { ActivityController } from "../controller/ActivityController.js";

const activityRouter = Router();
const activityController = new ActivityController();

activityRouter.get("/", activityController.findAll.bind(activityController));
activityRouter.get("/recent", activityController.findRecent.bind(activityController));
activityRouter.get("/:id", activityController.findById.bind(activityController));
activityRouter.post("/", activityController.create.bind(activityController));
activityRouter.put("/:id", activityController.update.bind(activityController));
activityRouter.delete("/:id", activityController.delete.bind(activityController));

export { activityRouter };