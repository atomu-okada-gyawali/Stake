import { Goal, TaskGoal, ProjectGoal, IGoalDocument } from "../models/Goal";

export async function createGoal(data: Record<string, unknown>): Promise<IGoalDocument> {
  const goalType = data.goalType;
  if (goalType === "task") {
    const goal = new TaskGoal(data);
    return goal.save();
  }
  if (goalType === "project") {
    const goal = new ProjectGoal(data);
    return goal.save();
  }
  const goal = new Goal(data);
  return goal.save();
}
