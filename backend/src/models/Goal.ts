import { Schema, model, Document, Types } from "mongoose";

export interface ISubtask {
  _id: Types.ObjectId;
  title: string;
  isCompleted: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface IGoal {
  creatorId: Types.ObjectId;
  title: string;
  description?: string;
  goalType: "task" | "project";
  startDate?: Date;
  endDate?: Date;
  stakeholders: Types.ObjectId[];
  status: "in_progress" | "completed" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskGoal extends IGoal {
  goalType: "task";
  daysOfWeek: number[]; // e.g. [1, 3, 5] representing Mon, Wed, Fri
}

export interface IProjectGoal extends IGoal {
  goalType: "project";
  subtasks: ISubtask[];
}

export interface IGoalDocument extends IGoal, Document {}
export interface ITaskGoalDocument extends ITaskGoal, Document {}
export interface IProjectGoalDocument extends IProjectGoal, Document {}

const baseOptions = {
  discriminatorKey: "goalType",
  collection: "goals",
  timestamps: true,
};

const GoalSchema = new Schema<IGoalDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    stakeholders: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "completed", "failed"],
      default: "in_progress",
      index: true,
    },
  },
  baseOptions,
);

export const Goal = model<IGoalDocument>("Goal", GoalSchema);

const TaskGoalSchema = new Schema<ITaskGoalDocument>({
  daysOfWeek: {
    type: [Number],
    default: [],
    validate: {
      validator: function (val: number[]) {
        // Enforce valid days of week: 0 (Sunday) to 6 (Saturday)
        return val.every((day) => day >= 0 && day <= 6);
      },
      message:
        "daysOfWeek must contain integers between 0 (Sunday) and 6 (Saturday).",
    },
  },
});

const SubtaskSchema = new Schema<ISubtask>({
  title: {
    type: String,
    required: [true, "Subtask title is required"],
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const ProjectGoalSchema = new Schema<IProjectGoalDocument>({
  subtasks: {
    type: [SubtaskSchema],
    default: [],
  },
});

export const TaskGoal = Goal.discriminator<ITaskGoalDocument>(
  "task",
  TaskGoalSchema,
);
export const ProjectGoal = Goal.discriminator<IProjectGoalDocument>(
  "project",
  ProjectGoalSchema,
);
