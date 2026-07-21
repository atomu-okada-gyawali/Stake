import { NextFunction, Request, Response } from "express";
import { getUserStats } from "../services/stats.service";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function getMyStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await getUserStats(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
