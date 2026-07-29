import { Types } from "mongoose";
import { Evidence, Goal, User } from "../models";
import { FailureReport } from "../models/FailureReport";
import { ITaskGoalDocument, IProjectGoalDocument } from "../models/Goal";
import { incrementUserScore } from "../repositories/user.repository";
import { setGoalStatus } from "../repositories/goal.repository";

const POINTS_PER_SUBMISSION = 10;
const POINTS_PER_VERIFICATION = 5;

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
  userAvatarUrl?: string;
  goalTitle: string;
  goalId: string;
  description: string | undefined;
  proofData: string;
  status: "pending" | "verified" | "failed";
  timestamp: string;
  canVerify: boolean;
  type: "proof" | "failure";
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
  await maybeMarkGoalCompleted(goal, input);

  return {
    id: evidence._id.toString(),
    goalId: evidence.goalId.toString(),
    subtaskId: evidence.subtaskId?.toString(),
    proofData: evidence.proofData,
    status: evidence.status,
    submittedAt: (evidence as unknown as { submittedAt: Date }).submittedAt.toISOString(),
  };
}

/**
 * A one-off task completes as soon as its (only) evidence is submitted. A project
 * completes once every subtask has non-failed evidence. Recurring tasks are never
 * completed here — they only finalize once their own window elapses (see goal.service.ts).
 */
async function maybeMarkGoalCompleted(
  goal: { _id: { toString(): string }; goalType: string; status: string },
  input: SubmitEvidenceInput,
): Promise<void> {
  if (goal.status !== "in_progress") return;

  if (input.subtaskId) {
    const projectGoal = goal as unknown as IProjectGoalDocument;
    const subtaskIds = projectGoal.subtasks.map((st) => st._id.toString());
    const statuses = await getSubtaskEvidenceStatuses(input.userId, subtaskIds);
    const allSubmitted = subtaskIds.every((id) => {
      const status = statuses.get(id);
      return status ? status !== "failed" : false;
    });
    if (allSubmitted) {
      await setGoalStatus(goal._id.toString(), "completed");
    }
    return;
  }

  if (goal.goalType === "task") {
    const taskGoal = goal as unknown as ITaskGoalDocument;
    const isRecurring = (taskGoal.daysOfWeek?.length ?? 0) > 0;
    if (!isRecurring) {
      await setGoalStatus(goal._id.toString(), "completed");
    }
  }
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
    .populate({ path: "goalId", select: "title creatorId stakeholders" })
    .populate({ path: "userId", select: "username avatarUrl" })
    .sort({ submittedAt: -1 })
    .limit(50);

  const feedItems: FeedItem[] = [];

  for (const item of evidenceItems) {
    const goal = item.goalId as unknown as {
      _id: { toString(): string };
      title: string;
      creatorId: { toString(): string };
      stakeholders: { toString(): string }[];
    };
    const creatorId = goal.creatorId.toString();

    if (!visibleIds.includes(creatorId)) {
      continue;
    }

    const evidenceUser = item.userId as unknown as { _id: { toString(): string }; username: string; avatarUrl?: string };
    const isDesignatedVerifier = (goal.stakeholders ?? []).some((s) => s.toString() === userId);
    const isOwnSubmission = evidenceUser._id.toString() === userId;

    feedItems.push({
      id: item._id.toString(),
      userName: evidenceUser.username,
      userId: evidenceUser._id.toString(),
      userAvatarUrl: evidenceUser.avatarUrl,
      goalTitle: goal.title,
      goalId: goal._id.toString(),
      description: undefined,
      proofData: item.proofData,
      status: item.status as "pending" | "verified" | "failed",
      timestamp: (item as unknown as { submittedAt: Date }).submittedAt.toISOString(),
      canVerify: item.status === "pending" && isDesignatedVerifier && !isOwnSubmission,
      type: "proof",
    });
  }

  const failureReports = await FailureReport.find({})
    .populate({ path: "goalId", select: "title creatorId" })
    .populate({ path: "userId", select: "username avatarUrl" })
    .sort({ createdAt: -1 })
    .limit(50);

  for (const report of failureReports) {
    const goal = report.goalId as unknown as {
      _id: { toString(): string };
      title: string;
      creatorId: { toString(): string };
    };

    if (!visibleIds.includes(goal.creatorId.toString())) {
      continue;
    }

    const reportUser = report.userId as unknown as {
      _id: { toString(): string };
      username: string;
      avatarUrl?: string;
    };

    feedItems.push({
      id: report._id.toString(),
      userName: reportUser.username,
      userId: reportUser._id.toString(),
      userAvatarUrl: reportUser.avatarUrl,
      goalTitle: goal.title,
      goalId: goal._id.toString(),
      description: report.reason,
      proofData: report.photoUrl ?? "",
      status: "failed",
      timestamp: report.createdAt.toISOString(),
      canVerify: false,
      type: "failure",
    });
  }

  feedItems.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return feedItems.slice(0, 50);
}

export interface VerifyEvidenceInput {
  evidenceId: string;
  verifierId: string;
  approved: boolean;
  comment?: string;
}

export async function verifyEvidence(input: VerifyEvidenceInput) {
  const evidence = await Evidence.findById(input.evidenceId);
  if (!evidence) {
    throw new Error("Evidence not found");
  }

  if (evidence.status !== "pending") {
    throw new Error("This submission has already been reviewed");
  }

  if (evidence.userId.toString() === input.verifierId) {
    throw new Error("You can't verify your own submission");
  }

  const goal = await Goal.findById(evidence.goalId).select("stakeholders");
  if (!goal) {
    throw new Error("Goal not found");
  }

  const isDesignatedVerifier = goal.stakeholders.some(
    (s) => s.toString() === input.verifierId,
  );
  if (!isDesignatedVerifier) {
    throw new Error("Only the designated verifier for this goal can verify this submission");
  }

  evidence.status = input.approved ? "verified" : "failed";
  evidence.verifications.push({
    verifierId: new Types.ObjectId(input.verifierId),
    approved: input.approved,
    comment: input.comment,
    verifiedAt: new Date(),
  });
  await evidence.save();

  if (input.approved) {
    await incrementUserScore(evidence.userId.toString(), POINTS_PER_VERIFICATION);
  }

  return {
    id: evidence._id.toString(),
    status: evidence.status,
  };
}
