import { Router } from "express";
import { changeEmail, login, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/email", requireAuth, changeEmail);

export default router;
