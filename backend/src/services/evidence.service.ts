import { Evidence, Goal, User } from "../models";
import { incrementUserScore } from "../repositories/user.repository";

const POINTS_PER_SUBMISSION = 10;

export interface SubmitEvidenceInput {
  goalId: string;
  userId: string;
  proofData: string;
  subtaskId?: string;
  reflection?: string;
}

export interface FeedItem {
  id: string;
  userName: string;
  userId: string;
  goalTitle: string;
  goalId: string;
  description: string | undefined;
  proofData: string;
  status: "pending" | "verified" | "failed";
  timestamp: string;
}

export async function submitEvidence(input: SubmitEvidenceInput) {
  const goal = await Goal.findById(input.goalId);
  if (!goal) {
    throw new Error("Goal not found");
  }

  if (goal.creatorId.toString() !== input.userId) {
    throw new Error("Only the goal creator can submit evidence");
  }

  if (input.subtaskId) {
    if (goal.goalType !== "project") {
      throw new Error("subtaskId is only valid for project goals");
    }
    const subtasks = (goal as unknown as { subtasks: { _id: { toString(): string } }[] })
      .subtasks;
    const subtaskExists = subtasks.some((st) => st._id.toString() === input.subtaskId);
    if (!subtaskExists) {
      throw new Error("Subtask not found on this goal");
    }
  }

  const evidence = await Evidence.create({
    goalId: input.goalId,
    subtaskId: input.subtaskId,
    userId: input.userId,
    proofData: input.proofData,
    status: "pending",
  });

  await incrementUserScore(input.userId, POINTS_PER_SUBMISSION);

  return {
    id: evidence._id.toString(),
    goalId: evidence.goalId.toString(),
    subtaskId: evidence.subtaskId?.toString(),
    proofData: evidence.proofData,
    status: evidence.status,
    submittedAt: (evidence as unknown as { submittedAt: Date }).submittedAt.toISOString(),
  };
}

export async function getSubtaskEvidenceStatuses(
  userId: string,
  subtaskIds: string[],
): Promise<Map<string, "pending" | "verified" | "failed">> {
  const latestBySubtask = new Map<string, "pending" | "verified" | "failed">();

  if (subtaskIds.length === 0) {
    return latestBySubtask;
  }

  const items = await Evidence.find({ userId, subtaskId: { $in: subtaskIds } }).sort({
    submittedAt: -1,
  });

  for (const item of items) {
    if (!item.subtaskId) continue;
    const subtaskId = item.subtaskId.toString();
    if (!latestBySubtask.has(subtaskId)) {
      latestBySubtask.set(subtaskId, item.status as "pending" | "verified" | "failed");
    }
  }

  return latestBySubtask;
}

export async function getCurrentEvidenceStatuses(
  userId: string,
  goalIds: string[],
): Promise<{
  latestByGoal: Map<string, "pending" | "verified" | "failed">;
  latestTodayByGoal: Map<string, "pending" | "verified" | "failed">;
}> {
  const latestByGoal = new Map<string, "pending" | "verified" | "failed">();
  const latestTodayByGoal = new Map<string, "pending" | "verified" | "failed">();

  if (goalIds.length === 0) {
    return { latestByGoal, latestTodayByGoal };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const items = await Evidence.find({ userId, goalId: { $in: goalIds } }).sort({
    submittedAt: -1,
  });

  for (const item of items) {
    const goalId = item.goalId.toString();
    const status = item.status as "pending" | "verified" | "failed";
    const submittedAt = (item as unknown as { submittedAt: Date }).submittedAt;

    if (!latestByGoal.has(goalId)) {
      latestByGoal.set(goalId, status);
    }
    if (
      submittedAt >= startOfToday &&
      submittedAt < endOfToday &&
      !latestTodayByGoal.has(goalId)
    ) {
      latestTodayByGoal.set(goalId, status);
    }
  }

  return { latestByGoal, latestTodayByGoal };
}

function toDateKey(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

export async function getSubmittedDateSets(
  userId: string,
  goalIds: string[],
): Promise<Map<string, Set<string>>> {
  const dateSetsByGoal = new Map<string, Set<string>>();

  if (goalIds.length === 0) {
    return dateSetsByGoal;
  }

  const items = await Evidence.find({ userId, goalId: { $in: goalIds } });

  for (const item of items) {
    if (item.status === "failed") continue;
    const goalId = item.goalId.toString();
    const submittedAt = (item as unknown as { submittedAt: Date }).submittedAt;
    if (!dateSetsByGoal.has(goalId)) {
      dateSetsByGoal.set(goalId, new Set());
    }
    dateSetsByGoal.get(goalId)!.add(toDateKey(submittedAt));
  }

  return dateSetsByGoal;
}

export async function getFeed(userId: string): Promise<FeedItem[]> {
  const user = await User.findById(userId).select("friends");
  if (!user) {
    throw new Error("User not found");
  }

  const friendIds = user.friends.map((f) => f.toString());
  const visibleIds = [...friendIds, userId];

  const evidenceItems = await Evidence.find({})
    .populate({ path: "goalId", select: "title creatorId" })
    .populate({ path: "userId", select: "username" })
    .sort({ submittedAt: -1 })
    .limit(50);

  const feedItems: FeedItem[] = [];

  for (const item of evidenceItems) {
    const goal = item.goalId as unknown as { _id: { toString(): string }; title: string; creatorId: { toString(): string } };
    const creatorId = goal.creatorId.toString();

    if (!visibleIds.includes(creatorId)) {
      continue;
    }

    const evidenceUser = item.userId as unknown as { _id: { toString(): string }; username: string };

    feedItems.push({
      id: item._id.toString(),
      userName: evidenceUser.username,
      userId: evidenceUser._id.toString(),
      goalTitle: goal.title,
      goalId: goal._id.toString(),
      description: undefined,
      proofData: item.proofData,
      status: item.status as "pending" | "verified" | "failed",
      timestamp: (item as unknown as { submittedAt: Date }).submittedAt.toISOString(),
    });
  }

  return feedItems;
}
