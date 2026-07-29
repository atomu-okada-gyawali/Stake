import { NextFunction, Request, Response } from "express";
import { submitEvidence, getFeed, verifyEvidence } from "../services/evidence.service";

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

    const { goalId, subtaskId } = req.body;
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
      subtaskId: subtaskId || undefined,
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

export async function verifyEvidenceHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    const { approved, comment } = req.body;

    if (typeof approved !== "boolean") {
      return res.status(400).json({ message: "approved (boolean) is required" });
    }

    const result = await verifyEvidence({
      evidenceId: id,
      verifierId: userId,
      approved,
      comment,
    });

    res.status(200).json(result);
  } catch (error) {
    const message = (error as Error).message;
    if (message === "Evidence not found" || message === "Goal not found") {
      return res.status(404).json({ message });
    }
    if (
      message === "Only the designated verifier for this goal can verify this submission" ||
      message === "You can't verify your own submission"
    ) {
      return res.status(403).json({ message });
    }
    if (message === "This submission has already been reviewed") {
      return res.status(409).json({ message });
    }
    next(error);
  }
}
