import { NextFunction, Request, Response } from "express";
import {
  changeUserEmail,
  loginUser,
  registerUser,
} from "../services/auth.service";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { fullName, username, ...rest } = req.body as {
      fullName?: string;
      username?: string;
      email?: string;
      password?: string;
    };

    const result = await registerUser({
      username: fullName || username,
      email: rest.email,
      password: rest.password,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function changeEmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { newEmail, currentPassword } = req.body;
    const result = await changeUserEmail(userId, newEmail, currentPassword);
    res
      .status(200)
      .json({ message: "Email updated successfully", user: result });
  } catch (error) {
    next(error);
  }
}
