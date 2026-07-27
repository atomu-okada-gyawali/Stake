import { Evidence, Goal } from "../models";

export interface UserStats {
  executionStreak: number;
  goalsInProgress: number;
  totalGoalsCompleted: number;
  peerValidated: number;
}

function toDateKey(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

async function getExecutionStreak(userId: string): Promise<number> {
  const items = await Evidence.find({ userId, status: { $ne: "failed" } }).select(
    "submittedAt",
  );

  const dates = new Set(
    items.map((item) => toDateKey((item as unknown as { submittedAt: Date }).submittedAt)),
  );

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Today doesn't break a streak before it's over — start counting from
  // yesterday if nothing has been submitted yet today.
  if (!dates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dates.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [executionStreak, goalsInProgress, totalGoalsCompleted, peerValidated] =
    await Promise.all([
      getExecutionStreak(userId),
      Goal.countDocuments({ creatorId: userId, status: "in_progress" }),
      Goal.countDocuments({ creatorId: userId, status: "completed" }),
      Evidence.countDocuments({ userId, status: "verified" }),
    ]);

  return { executionStreak, goalsInProgress, totalGoalsCompleted, peerValidated };
}
