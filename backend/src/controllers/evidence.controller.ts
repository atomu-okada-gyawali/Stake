import { NextFunction, Request, Response } from "express";
import { submitEvidence, getFeed } from "../services/evidence.service";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function createEvidence(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("createEvidence body:", req.body);
    console.log("createEvidence file:", req.file);

    const { goalId } = req.body;
    if (!goalId) {
      return res.status(400).json({ message: "goalId is required" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Proof file is required" });
    }

    const proofData = `/uploads/${file.filename}`;

    const result = await submitEvidence({
      goalId,
      userId,
      proofData,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("createEvidence error:", error);
    next(error);
  }
}

export async function getFeedHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const feed = await getFeed(userId);
    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
}
