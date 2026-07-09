import { NextFunction, Request, Response } from "express";
import { createGoalForUser, getUserGoals } from "../services/goal.service";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function createGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await createGoalForUser({
      creatorId: userId,
      ...req.body,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listUserGoals(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await getUserGoals(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
