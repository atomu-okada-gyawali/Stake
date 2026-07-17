import { Router } from "express";
import multer from "multer";
import path from "node:path";
import {
  changeEmail,
  getMe,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG and PNG files are allowed"));
    }
  },
});

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);
router.patch("/email", requireAuth, changeEmail);
router.patch("/profile", requireAuth, upload.single("avatar"), updateProfile);

export default router;
