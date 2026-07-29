import { Types } from "mongoose";
import { User } from "../models/User";
import { FriendRequest } from "../models/FriendRequest";

export async function sendFriendRequest(senderId: string, receiverIdentifier: string) {
  const orConditions: Record<string, unknown>[] = [
    { username: receiverIdentifier },
    { email: receiverIdentifier.toLowerCase() },
  ];

  if (Types.ObjectId.isValid(receiverIdentifier)) {
    orConditions.push({ _id: receiverIdentifier });
  }

  const receiver = await User.findOne({ $or: orConditions });
  if (!receiver) {
    throw new Error("User not found");
  }

  if (receiver._id.toString() === senderId) {
    throw new Error("Cannot send friend request to yourself");
  }

  const sender = await User.findById(senderId);
  if (!sender) {
    throw new Error("Sender not found");
  }

  const alreadyFriends = sender.friends.some(
    (f) => f.toString() === receiver._id.toString(),
  );
  if (alreadyFriends) {
    throw new Error("Already friends with this user");
  }

  const existing = await FriendRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiver._id },
      { sender: receiver._id, receiver: senderId },
    ],
    status: "pending",
  });
  if (existing) {
    throw new Error("Friend request already exists");
  }

  const request = await FriendRequest.create({
    sender: senderId,
    receiver: receiver._id,
    status: "pending",
  });

  return {
    id: request._id.toString(),
    sender: senderId,
    receiver: receiver._id.toString(),
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  };
}

export async function acceptFriendRequest(userId: string, requestId: string) {
  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new Error("Friend request not found");
  }

  if (request.receiver.toString() !== userId) {
    throw new Error("Only the receiver can accept this request");
  }

  if (request.status !== "pending") {
    throw new Error("Friend request is no longer pending");
  }

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(userId, {
    $addToSet: { friends: request.sender },
  });
  await User.findByIdAndUpdate(request.sender, {
    $addToSet: { friends: userId },
  });

  return {
    id: request._id.toString(),
    status: "accepted",
  };
}

export async function declineFriendRequest(userId: string, requestId: string) {
  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new Error("Friend request not found");
  }

  if (request.receiver.toString() !== userId) {
    throw new Error("Only the receiver can decline this request");
  }

  if (request.status !== "pending") {
    throw new Error("Friend request is no longer pending");
  }

  request.status = "declined";
  await request.save();

  return {
    id: request._id.toString(),
    status: "declined",
  };
}

export async function cancelFriendRequest(userId: string, requestId: string) {
  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new Error("Friend request not found");
  }

  if (request.sender.toString() !== userId) {
    throw new Error("Only the sender can cancel this request");
  }

  if (request.status !== "pending") {
    throw new Error("Friend request is no longer pending");
  }

  await FriendRequest.findByIdAndDelete(requestId);

  return { id: requestId, status: "cancelled" };
}

export async function getFriends(userId: string) {
  const user = await User.findById(userId).populate("friends", "username email avatarUrl createdAt");
  if (!user) {
    throw new Error("User not found");
  }

  return user.friends.map((f) => ({
    id: f._id.toString(),
    username: (f as unknown as { username: string }).username,
    email: (f as unknown as { email: string }).email,
    avatarUrl: (f as unknown as { avatarUrl?: string }).avatarUrl,
    createdAt: (f as unknown as { createdAt: Date }).createdAt?.toISOString(),
  }));
}

export async function getFriendRequests(userId: string) {
  const received = await FriendRequest.find({ receiver: userId, status: "pending" })
    .populate("sender", "username email avatarUrl")
    .sort({ createdAt: -1 });

  const sent = await FriendRequest.find({ sender: userId, status: "pending" })
    .populate("receiver", "username email avatarUrl")
    .sort({ createdAt: -1 });

  return {
    received: received.map((r) => ({
      id: r._id.toString(),
      sender: {
        id: (r.sender as unknown as { _id: { toString(): string }; username: string; email: string })._id.toString(),
        username: (r.sender as unknown as { username: string }).username,
        email: (r.sender as unknown as { email: string }).email,
        avatarUrl: (r.sender as unknown as { avatarUrl?: string }).avatarUrl,
      },
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    sent: sent.map((r) => ({
      id: r._id.toString(),
      receiver: {
        id: (r.receiver as unknown as { _id: { toString(): string }; username: string; email: string })._id.toString(),
        username: (r.receiver as unknown as { username: string }).username,
        email: (r.receiver as unknown as { email: string }).email,
        avatarUrl: (r.receiver as unknown as { avatarUrl?: string }).avatarUrl,
      },
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function searchUsers(query: string, currentUserId: string) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const regex = new RegExp(query.trim(), "i");
  const users = await User.find({
    $and: [
      { _id: { $ne: currentUserId } },
      {
        $or: [
          { username: regex },
          { email: regex },
        ],
      },
    ],
  })
    .select("username email avatarUrl")
    .limit(20);

  const currentUser = await User.findById(currentUserId).select("friends");
  const friendIds = currentUser ? currentUser.friends.map((f) => f.toString()) : [];

  const pendingRequests = await FriendRequest.find({
    $or: [
      { sender: currentUserId, status: "pending" },
      { receiver: currentUserId, status: "pending" },
    ],
  });

  const pendingSenderIds = pendingRequests
    .filter((r) => r.sender.toString() === currentUserId)
    .map((r) => r.receiver.toString());
  const pendingReceiverIds = pendingRequests
    .filter((r) => r.receiver.toString() === currentUserId)
    .map((r) => r.sender.toString());
  const pendingIds = [...pendingSenderIds, ...pendingReceiverIds];

  return users.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl,
    isFriend: friendIds.includes(u._id.toString()),
    hasPendingRequest: pendingIds.includes(u._id.toString()),
  }));
}

export async function getLeaderboard(currentUserId: string) {
  const currentUser = await User.findById(currentUserId).select("friends");
  if (!currentUser) {
    throw new Error("User not found");
  }

  const ids = [currentUserId, ...currentUser.friends.map((f) => f.toString())];
  const users = await User.find({ _id: { $in: ids } }).select("username score avatarUrl");

  return users
    .map((u) => ({
      id: u._id.toString(),
      username: u.username,
      score: u.score ?? 0,
      avatarUrl: u.avatarUrl,
      isCurrentUser: u._id.toString() === currentUserId,
    }))
    .sort((a, b) => b.score - a.score);
}

export async function getSuggestions(currentUserId: string) {
  const currentUser = await User.findById(currentUserId).select("friends");
  if (!currentUser) {
    throw new Error("User not found");
  }

  const friendIds = currentUser.friends.map((f) => f.toString());
  const excludeIds = [currentUserId, ...friendIds];

  const pendingRequests = await FriendRequest.find({
    $or: [
      { sender: currentUserId },
      { receiver: currentUserId },
    ],
    status: "pending",
  });

  const pendingUserIds = pendingRequests.map((r) =>
    r.sender.toString() === currentUserId ? r.receiver.toString() : r.sender.toString(),
  );
  excludeIds.push(...pendingUserIds);

  const suggestions = await User.find({
    _id: { $nin: excludeIds },
  })
    .select("username email avatarUrl")
    .limit(10);

  return suggestions.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl,
  }));
}
