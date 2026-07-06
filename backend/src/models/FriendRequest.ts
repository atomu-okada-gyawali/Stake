import { Schema, model, Document, Types } from "mongoose";

export interface IFriendRequest {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

export interface IFriendRequestDocument extends IFriendRequest, Document {}

const FriendRequestSchema = new Schema<IFriendRequestDocument>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export const FriendRequest = model<IFriendRequestDocument>("FriendRequest", FriendRequestSchema);
