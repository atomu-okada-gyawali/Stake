import { Router } from "express";
import { createGoal } from "../controllers/goal.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createGoal);

export default router;
