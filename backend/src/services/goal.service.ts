import { User } from "../models/User";
import { ITaskGoalDocument, IProjectGoalDocument } from "../models/Goal";
import {
  createGoal,
  findGoalsByUser,
  addPenalizedDates,
  setGoalStatus,
  markSubtaskPenalized,
} from "../repositories/goal.repository";
import { incrementUserScore } from "../repositories/user.repository";
import {
  getCurrentEvidenceStatuses,
  getSubtaskEvidenceStatuses,
  getSubmittedDateSets,
} from "./evidence.service";

const DEADLINE_MISS_PENALTY = 5;

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

function toDateKey(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Returns the calendar dates (midnight, local) on which a task goal was due but has already elapsed. */
function getElapsedTaskOccurrences(goal: ITaskGoalDocument): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = goal.startDate ? new Date(goal.startDate) : undefined;
  const endDate = goal.endDate ? new Date(goal.endDate) : undefined;

  if (!goal.daysOfWeek || goal.daysOfWeek.length === 0) {
    // One-off task: its single "occurrence" is its own deadline (endDate, falling back to startDate).
    const deadline = endDate ?? startDate;
    if (!deadline) return [];
    const d = new Date(deadline);
    d.setHours(0, 0, 0, 0);
    return d < today ? [d] : [];
  }

  if (!startDate) return [];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const rangeEnd = endDate && endDate < yesterday ? endDate : yesterday;

  const occurrences: Date[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= rangeEnd) {
    if (goal.daysOfWeek.includes(cursor.getDay())) {
      occurrences.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return occurrences;
}

/** Deducts points for any elapsed task occurrence that was never submitted, once per occurrence. */
async function applyTaskDeadlinePenalties(
  userId: string,
  goal: ITaskGoalDocument,
  submittedDates: Set<string>,
): Promise<void> {
  if (goal.status !== "in_progress") return;

  const isRecurring = goal.daysOfWeek.length > 0;
  const occurrences = getElapsedTaskOccurrences(goal);

  if (occurrences.length > 0) {
    const alreadyPenalized = new Set((goal.penalizedDates ?? []).map((d) => toDateKey(d)));
    const missed = occurrences.filter(
      (occ) => !alreadyPenalized.has(toDateKey(occ)) && !submittedDates.has(toDateKey(occ)),
    );

    if (missed.length > 0) {
      await incrementUserScore(userId, -DEADLINE_MISS_PENALTY * missed.length);
      await addPenalizedDates(goal._id.toString(), missed);
      goal.penalizedDates = [...(goal.penalizedDates ?? []), ...missed];

      if (!isRecurring) {
        await setGoalStatus(goal._id.toString(), "failed");
        goal.status = "failed";
        return;
      }
    }
  }

  // A recurring task finalizes once its own window has fully elapsed: clean if it
  // was never missed, otherwise failed (each miss was already penalized above).
  if (isRecurring && goal.endDate && goal.status === "in_progress") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(goal.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      const finalStatus = (goal.penalizedDates ?? []).length === 0 ? "completed" : "failed";
      await setGoalStatus(goal._id.toString(), finalStatus);
      goal.status = finalStatus;
    }
  }
}

/** Deducts points for any project subtask whose deadline has elapsed without submitted evidence. */
async function applyProjectSubtaskPenalties(
  userId: string,
  goal: IProjectGoalDocument,
  latestBySubtask: Map<string, "pending" | "verified" | "failed">,
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const st of goal.subtasks) {
    if (st.deadlinePenaltyApplied) continue;

    const deadline = new Date(st.deadline);
    deadline.setHours(0, 0, 0, 0);
    if (deadline >= today) continue;

    const status = latestBySubtask.get(st._id.toString());
    const submitted = status ? status !== "failed" : false;
    if (submitted) continue;

    await incrementUserScore(userId, -DEADLINE_MISS_PENALTY);
    await markSubtaskPenalized(goal._id.toString(), st._id.toString());
    st.deadlinePenaltyApplied = true;
  }
}

export async function getUserGoals(userId: string): Promise<GoalResponse[]> {
  const goals = await findGoalsByUser(userId);

  const taskGoals = goals.filter((g) => g.goalType === "task") as unknown as ITaskGoalDocument[];
  const projectGoals = goals.filter(
    (g) => g.goalType === "project",
  ) as unknown as IProjectGoalDocument[];

  const taskGoalIds = taskGoals.map((g) => g._id.toString());
  const { latestByGoal, latestTodayByGoal } = await getCurrentEvidenceStatuses(
    userId,
    taskGoalIds,
  );
  const submittedDateSets = await getSubmittedDateSets(userId, taskGoalIds);

  const subtaskIds = projectGoals.flatMap((g) => g.subtasks.map((st) => st._id.toString()));
  const latestBySubtask = await getSubtaskEvidenceStatuses(userId, subtaskIds);

  for (const goal of taskGoals) {
    await applyTaskDeadlinePenalties(
      userId,
      goal,
      submittedDateSets.get(goal._id.toString()) ?? new Set(),
    );
  }
  for (const goal of projectGoals) {
    await applyProjectSubtaskPenalties(userId, goal, latestBySubtask);
  }

  const formatted = goals.map((g) => formatGoal(g.toObject()));

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
