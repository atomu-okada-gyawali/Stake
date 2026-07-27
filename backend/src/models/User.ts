import { Schema, model, Document, Types } from "mongoose";

/**
 * Interface representing a User document in MongoDB.
 */
export interface IUser {
  fullName: string;
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  score: number;
  friends: Types.ObjectId[];
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Disables updatedAt as per instructions
  },
);

export const User = model<IUserDocument>("User", UserSchema);
