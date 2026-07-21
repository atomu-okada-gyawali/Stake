import { Schema, model, Document, Types } from "mongoose";

export interface IFailureReport {
  goalId: Types.ObjectId;
  subtaskId?: Types.ObjectId;
  occurrenceDate?: Date;
  userId: Types.ObjectId;
  reason: string;
  createdAt: Date;
}

export interface IFailureReportDocument extends IFailureReport, Document {}

const FailureReportSchema = new Schema<IFailureReportDocument>(
  {
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: [true, "Goal ID is required"],
      index: true,
    },
    subtaskId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },
    occurrenceDate: {
      type: Date,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    reason: {
      type: String,
      required: [true, "A reason is required"],
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const FailureReport = model<IFailureReportDocument>(
  "FailureReport",
  FailureReportSchema,
);
