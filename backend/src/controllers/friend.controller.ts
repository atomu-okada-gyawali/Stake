import { NextFunction, Request, Response } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getFriends,
  getFriendRequests,
  searchUsers,
  getSuggestions,
} from "../services/friend.service";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function sendRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { identifier } = req.body as { identifier: string };
    if (!identifier || identifier.trim().length === 0) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    const result = await sendFriendRequest(userId, identifier.trim());
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function acceptRequest(
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
    const result = await acceptFriendRequest(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function declineRequest(
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
    const result = await declineFriendRequest(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function cancelRequest(
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
    const result = await cancelFriendRequest(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listFriends(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await getFriends(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listRequests(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await getFriendRequests(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function search(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const query = (req.query.q as string) ?? "";
    const result = await searchUsers(query, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function suggestions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const result = await getSuggestions(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
