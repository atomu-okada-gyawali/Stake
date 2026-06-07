import { IUserDocument, User } from "../models/User";

export async function findUserByEmail(
  email: string,
): Promise<IUserDocument | null> {
  return User.findOne({ email }).exec();
}

export async function findUserByUsername(
  username: string,
): Promise<IUserDocument | null> {
  return User.findOne({ username }).exec();
}

export async function findUserById(id: string): Promise<IUserDocument | null> {
  return User.findById(id).exec();
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<IUserDocument> {
  const user = new User(data);
  return user.save();
}

export async function updateUserEmail(
  userId: string,
  email: string,
): Promise<IUserDocument | null> {
  return User.findByIdAndUpdate(userId, { email }, { new: true }).exec();
}
