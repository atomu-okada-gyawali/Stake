import { Router } from "express";
import { getMyStats } from "../controllers/stats.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getMyStats);

export default router;
