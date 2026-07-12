import { Router } from "express";
import { createGoal, listUserGoals } from "../controllers/goal.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createGoal);
router.get("/", requireAuth, listUserGoals);

export default router;
