import { Router } from "express";
import {
  listFailureHistory,
  createFailureReport,
} from "../controllers/failureReport.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, listFailureHistory);
router.post("/", requireAuth, createFailureReport);

export default router;
