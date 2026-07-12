import { User } from "../models/User";
import { createGoal, findGoalsByUser } from "../repositories/goal.repository";
import { getCurrentEvidenceStatuses, getSubtaskEvidenceStatuses } from "./evidence.service";

export interface CreateGoalInput {
  creatorId: string;
  title: string;
  description?: string;
  goalType: "task" | "project";
  startDate?: string;
  endDate?: string;
  stakeholders?: string[];
  daysOfWeek?: number[];
  subtasks?: { title: string; deadline: string }[];
}

export interface SubtaskResponse {
  id: string;
  title: string;
  deadline: string;
  submitted: boolean;
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
  subtasks?: SubtaskResponse[];
  createdAt: string;
  updatedAt: string;
  submittedForCurrentPeriod: boolean;
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
      ? (doc.subtasks as { _id: { toString(): string }; title: string; deadline: Date }[]).map(
          (st) => ({
            id: st._id.toString(),
            title: st.title,
            deadline: new Date(st.deadline).toISOString(),
            submitted: false,
          }),
        )
      : undefined,
    createdAt: new Date(doc.createdAt as string).toISOString(),
    updatedAt: new Date(doc.updatedAt as string).toISOString(),
    submittedForCurrentPeriod: false,
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

  if (input.goalType === "project" && input.subtasks) {
    const startDate = input.startDate ? new Date(input.startDate) : undefined;
    const endDate = input.endDate ? new Date(input.endDate) : undefined;

    for (const st of input.subtasks) {
      if (!st.deadline) {
        throw new Error(`Subtask "${st.title}" requires a deadline`);
      }
      const deadline = new Date(st.deadline);
      if (startDate && deadline < startDate) {
        throw new Error(
          `Subtask "${st.title}" deadline cannot be before the project's start date`,
        );
      }
      if (endDate && deadline > endDate) {
        throw new Error(
          `Subtask "${st.title}" deadline cannot be after the project's end date`,
        );
      }
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
            deadline: new Date(st.deadline),
          }))
        : undefined,
  });

  return formatGoal(goal.toObject());
}

export async function getUserGoals(userId: string): Promise<GoalResponse[]> {
  const goals = await findGoalsByUser(userId);
  const formatted = goals.map((g) => formatGoal(g.toObject()));

  const taskGoalIds = formatted.filter((g) => g.goalType === "task").map((g) => g.id);
  const { latestByGoal, latestTodayByGoal } = await getCurrentEvidenceStatuses(
    userId,
    taskGoalIds,
  );

  const subtaskIds = formatted.flatMap((g) => (g.subtasks ?? []).map((st) => st.id));
  const latestBySubtask = await getSubtaskEvidenceStatuses(userId, subtaskIds);

  return formatted.map((g) => {
    if (g.goalType === "task") {
      const isRecurring = (g.daysOfWeek?.length ?? 0) > 0;
      const status = isRecurring ? latestTodayByGoal.get(g.id) : latestByGoal.get(g.id);
      return {
        ...g,
        submittedForCurrentPeriod: status ? status !== "failed" : false,
      };
    }

    return {
      ...g,
      subtasks: g.subtasks?.map((st) => {
        const status = latestBySubtask.get(st.id);
        return { ...st, submitted: status ? status !== "failed" : false };
      }),
    };
  });
}
