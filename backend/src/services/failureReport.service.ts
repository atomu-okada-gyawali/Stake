import { Goal, ITaskGoalDocument, IProjectGoalDocument } from "../models/Goal";
import {
  findFailureReportsByUser,
  upsertFailureReport,
} from "../repositories/failureReport.repository";

export interface FailedItem {
  goalId: string;
  subtaskId?: string;
  occurrenceDate?: string;
  title: string;
  description: string | undefined;
  date: string;
  reported: boolean;
  reason?: string;
}

function reportKey(goalId: string, subtaskId?: string, occurrenceDate?: Date): string {
  const dateKey = occurrenceDate ? new Date(occurrenceDate).toISOString().slice(0, 10) : "";
  return `${goalId}|${subtaskId ?? ""}|${dateKey}`;
}

export async function getFailureHistory(userId: string): Promise<FailedItem[]> {
  const goals = await Goal.find({
    creatorId: userId,
    $or: [
      { goalType: "task", "penalizedDates.0": { $exists: true } },
      { goalType: "project", "subtasks.deadlinePenaltyApplied": true },
    ],
  });

  const reports = await findFailureReportsByUser(userId);
  const reportMap = new Map<string, { reason: string }>();
  for (const r of reports) {
    reportMap.set(
      reportKey(r.goalId.toString(), r.subtaskId?.toString(), r.occurrenceDate),
      { reason: r.reason },
    );
  }

  const items: FailedItem[] = [];

  for (const goal of goals) {
    if (goal.goalType === "task") {
      const taskGoal = goal as unknown as ITaskGoalDocument;
      for (const occurrenceDate of taskGoal.penalizedDates ?? []) {
        const report = reportMap.get(reportKey(goal._id.toString(), undefined, occurrenceDate));
        items.push({
          goalId: goal._id.toString(),
          occurrenceDate: new Date(occurrenceDate).toISOString(),
          title: goal.title,
          description: goal.description,
          date: new Date(occurrenceDate).toISOString(),
          reported: !!report,
          reason: report?.reason,
        });
      }
    } else if (goal.goalType === "project") {
      const projectGoal = goal as unknown as IProjectGoalDocument;
      for (const st of projectGoal.subtasks) {
        if (!st.deadlinePenaltyApplied) continue;
        const report = reportMap.get(reportKey(goal._id.toString(), st._id.toString()));
        items.push({
          goalId: goal._id.toString(),
          subtaskId: st._id.toString(),
          title: `${goal.title}: ${st.title}`,
          description: goal.description,
          date: new Date(st.deadline).toISOString(),
          reported: !!report,
          reason: report?.reason,
        });
      }
    }
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

export interface SubmitFailureReportInput {
  userId: string;
  goalId: string;
  subtaskId?: string;
  occurrenceDate?: string;
  reason: string;
}

export async function submitFailureReport(input: SubmitFailureReportInput) {
  if (!input.reason || input.reason.trim().length === 0) {
    throw new Error("A reason is required");
  }

  const goal = await Goal.findById(input.goalId);
  if (!goal) {
    throw new Error("Goal not found");
  }
  if (goal.creatorId.toString() !== input.userId) {
    throw new Error("Only the goal creator can submit a failure report");
  }

  let occurrenceDate: Date | undefined;

  if (input.subtaskId) {
    if (goal.goalType !== "project") {
      throw new Error("subtaskId is only valid for project goals");
    }
    const projectGoal = goal as unknown as IProjectGoalDocument;
    const subtask = projectGoal.subtasks.find((st) => st._id.toString() === input.subtaskId);
    if (!subtask || !subtask.deadlinePenaltyApplied) {
      throw new Error("This subtask has not been marked as missed");
    }
  } else if (input.occurrenceDate) {
    if (goal.goalType !== "task") {
      throw new Error("occurrenceDate is only valid for task goals");
    }
    const taskGoal = goal as unknown as ITaskGoalDocument;
    const targetKey = new Date(input.occurrenceDate).toISOString().slice(0, 10);
    const matches = (taskGoal.penalizedDates ?? []).some(
      (d) => new Date(d).toISOString().slice(0, 10) === targetKey,
    );
    if (!matches) {
      throw new Error("This occurrence has not been marked as missed");
    }
    occurrenceDate = new Date(targetKey);
  } else {
    throw new Error("Either subtaskId or occurrenceDate is required");
  }

  const report = await upsertFailureReport({
    userId: input.userId,
    goalId: input.goalId,
    subtaskId: input.subtaskId,
    occurrenceDate,
    reason: input.reason.trim(),
  });

  return {
    id: report._id.toString(),
    goalId: report.goalId.toString(),
    subtaskId: report.subtaskId?.toString(),
    occurrenceDate: report.occurrenceDate?.toISOString(),
    reason: report.reason,
    createdAt: report.createdAt.toISOString(),
  };
}
