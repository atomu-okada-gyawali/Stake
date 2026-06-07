import { comparePassword, hashPassword } from '../utils/password.util';
import { signJwt } from '../utils/jwt.util';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  updateUserEmail,
} from '../repositories/user.repository';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const existingEmail = await findUserByEmail(input.email.toLowerCase());
  if (existingEmail) {
    throw new Error('Email is already in use');
  }

  const existingUsername = await findUserByUsername(input.username);
  if (existingUsername) {
    throw new Error('Username is already in use');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    username: input.username,
    email: input.email.toLowerCase(),
    password: passwordHash,
  });

  const token = signJwt({ sub: user._id.toString(), email: user.email });

  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email.toLowerCase());
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await comparePassword(input.password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = signJwt({ sub: user._id.toString(), email: user.email });

  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function changeUserEmail(userId: string, newEmail: string, currentPassword: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatches = await comparePassword(currentPassword, user.password);
  if (!passwordMatches) {
    throw new Error('Current password is incorrect');
  }

  if (user.email === newEmail.toLowerCase()) {
    throw new Error('New email must be different from the current email');
  }

  const existingEmail = await findUserByEmail(newEmail.toLowerCase());
  if (existingEmail) {
    throw new Error('Email is already in use');
  }

  const updatedUser = await updateUserEmail(userId, newEmail.toLowerCase());
  if (!updatedUser) {
    throw new Error('Failed to update email');
  }

  return {
    id: updatedUser._id.toString(),
    username: updatedUser.username,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
  };
}
