import { NextFunction, Request, Response } from "express";
import {
  getFailureHistory,
  submitFailureReport,
} from "../services/failureReport.service";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function listFailureHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await getFailureHistory(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createFailureReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { goalId, subtaskId, occurrenceDate, reason } = req.body as {
      goalId?: string;
      subtaskId?: string;
      occurrenceDate?: string;
      reason?: string;
    };

    if (!goalId) {
      return res.status(400).json({ message: "goalId is required" });
    }

    const result = await submitFailureReport({
      userId,
      goalId,
      subtaskId,
      occurrenceDate,
      reason: reason ?? "",
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
