import { Router } from "express";
import multer from "multer";
import path from "node:path";
import {
  listFailureHistory,
  createFailureReport,
} from "../controllers/failureReport.controller";
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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".mp4"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and MP4 files are allowed"));
    }
  },
});

const router = Router();

router.get("/", requireAuth, listFailureHistory);
router.post("/", requireAuth, upload.single("photo"), createFailureReport);

export default router;
