import { Evidence, Goal, User } from "../models";

export interface SubmitEvidenceInput {
  goalId: string;
  userId: string;
  proofData: string;
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

  const evidence = await Evidence.create({
    goalId: input.goalId,
    userId: input.userId,
    proofData: input.proofData,
    status: "pending",
  });

  return {
    id: evidence._id.toString(),
    goalId: evidence.goalId.toString(),
    proofData: evidence.proofData,
    status: evidence.status,
    submittedAt: (evidence as unknown as { submittedAt: Date }).submittedAt.toISOString(),
  };
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
