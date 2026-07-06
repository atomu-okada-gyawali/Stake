import { User } from "../models/User";
import { createGoal } from "../repositories/goal.repository";

export interface CreateGoalInput {
  creatorId: string;
  title: string;
  description?: string;
  goalType: "task" | "project";
  startDate?: string;
  endDate?: string;
  stakeholders?: string[];
  daysOfWeek?: number[];
  subtasks?: { title: string }[];
}

export interface GoalResponse {
  id: string;
  creatorId: string;
  title: string;
  description: string | undefined;
  goalType: "task" | "project";
  startDate: string | undefined;
  endDate: string | undefined;
  stakeholders: string[];
  status: string;
  daysOfWeek?: number[];
  subtasks?: { title: string; isCompleted: boolean }[];
  createdAt: string;
  updatedAt: string;
}

function formatGoal(goal: Record<string, unknown>): GoalResponse {
  const doc = goal as Record<string, unknown> & { _id: { toString(): string } };
  return {
    id: doc._id.toString(),
    creatorId: (doc.creatorId as { toString(): string }).toString(),
    title: doc.title as string,
    description: doc.description as string | undefined,
    goalType: doc.goalType as "task" | "project",
    startDate: doc.startDate
      ? new Date(doc.startDate as string).toISOString()
      : undefined,
    endDate: doc.endDate
      ? new Date(doc.endDate as string).toISOString()
      : undefined,
    stakeholders: (doc.stakeholders as { toString(): string }[]).map((s) =>
      s.toString(),
    ),
    status: doc.status as string,
    daysOfWeek: doc.daysOfWeek as number[] | undefined,
    subtasks: doc.subtasks
      ? (doc.subtasks as { title: string; isCompleted: boolean }[])
      : undefined,
    createdAt: new Date(doc.createdAt as string).toISOString(),
    updatedAt: new Date(doc.updatedAt as string).toISOString(),
  };
}

export async function createGoalForUser(input: CreateGoalInput): Promise<GoalResponse> {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Goal title is required");
  }

  if (!input.goalType || !["task", "project"].includes(input.goalType)) {
    throw new Error("goalType must be either 'task' or 'project'");
  }

  if (input.goalType === "task" && input.daysOfWeek) {
    const valid = input.daysOfWeek.every((d) => d >= 0 && d <= 6);
    if (!valid) {
      throw new Error("daysOfWeek must contain integers between 0 and 6");
    }
  }

  const stakeholders = input.stakeholders ?? [];
  if (stakeholders.length > 0) {
    const creator = await User.findById(input.creatorId).select("friends");
    if (!creator) {
      throw new Error("Creator not found");
    }
    const friendIds = creator.friends.map((f) => f.toString());
    const invalid = stakeholders.filter((s) => !friendIds.includes(s));
    if (invalid.length > 0) {
      throw new Error(
        `Stakeholders must be friends of the creator. Invalid: ${invalid.join(", ")}`,
      );
    }
  }

  const goal = await createGoal({
    creatorId: input.creatorId,
    title: input.title.trim(),
    description: input.description?.trim(),
    goalType: input.goalType,
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    endDate: input.endDate ? new Date(input.endDate) : undefined,
    stakeholders,
    status: "in_progress",
    daysOfWeek: input.goalType === "task" ? (input.daysOfWeek ?? []) : undefined,
    subtasks:
      input.goalType === "project"
        ? (input.subtasks ?? []).map((st) => ({
            title: st.title,
            isCompleted: false,
          }))
        : undefined,
  });

  return formatGoal(goal.toObject());
}
