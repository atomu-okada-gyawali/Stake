import { Router } from "express";
import {
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  listFriends,
  listRequests,
  search,
  suggestions,
} from "../controllers/friend.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/request", requireAuth, sendRequest);
router.patch("/request/:id/accept", requireAuth, acceptRequest);
router.patch("/request/:id/decline", requireAuth, declineRequest);
router.delete("/request/:id", requireAuth, cancelRequest);
router.get("/", requireAuth, listFriends);
router.get("/requests", requireAuth, listRequests);
router.get("/search", requireAuth, search);
router.get("/suggestions", requireAuth, suggestions);

export default router;
