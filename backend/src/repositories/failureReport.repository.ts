import { FailureReport, IFailureReportDocument } from "../models/FailureReport";

export async function findFailureReportsByUser(
  userId: string,
): Promise<IFailureReportDocument[]> {
  return FailureReport.find({ userId }).exec();
}

export async function upsertFailureReport(data: {
  userId: string;
  goalId: string;
  subtaskId?: string;
  occurrenceDate?: Date;
  reason: string;
  photoUrl?: string;
}): Promise<IFailureReportDocument> {
  const filter: Record<string, unknown> = {
    userId: data.userId,
    goalId: data.goalId,
    subtaskId: data.subtaskId ?? { $exists: false },
    occurrenceDate: data.occurrenceDate ?? { $exists: false },
  };

  const update: Record<string, unknown> = {
    userId: data.userId,
    goalId: data.goalId,
    subtaskId: data.subtaskId,
    occurrenceDate: data.occurrenceDate,
    reason: data.reason,
  };
  // Keep the existing photo when the report is edited without re-uploading one.
  if (data.photoUrl) {
    update.photoUrl = data.photoUrl;
  }

  const result = await FailureReport.findOneAndUpdate(
    filter,
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();

  return result!;
}
