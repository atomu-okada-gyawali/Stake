import { Router } from "express";
import { changeEmail, login, logout, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.patch("/email", requireAuth, changeEmail);

export default router;
