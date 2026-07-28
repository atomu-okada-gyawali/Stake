// Populates the database with a small, internally-consistent demo dataset:
// several users, friendships (accepted + pending), goals of every type/status,
// evidence submissions, and failure reports.
//
// Safe to re-run: it only ever deletes documents belonging to the fixed set of
// @stakedemo.dev seed accounts below, never anything else in the database.
//
// Usage: npm run seed

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { User, IUserDocument } from "../models/User";
import { Goal, TaskGoal, ProjectGoal } from "../models/Goal";
import { Evidence } from "../models/Evidence";
import { FailureReport } from "../models/FailureReport";
import { FriendRequest } from "../models/FriendRequest";
import { hashPassword } from "../utils/password.util";

const SEED_PASSWORD = "Password123!";

function mkDay(offset: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
}
const daysAgo = (n: number) => mkDay(-n);
const daysFromNow = (n: number) => mkDay(n);

/** Mirrors goal.service.ts's own elapsed-occurrence logic so seeded recurring
 * goals never leave a backlog of un-submitted/un-penalized days for the app's
 * lazy penalty job to "discover" (and silently dock score) on first load. */
function elapsedOccurrences(startDate: Date, daysOfWeek: number[]): Date[] {
  const yesterday = daysAgo(1);
  const out: Date[] = [];
  const cursor = new Date(startDate);
  while (cursor <= yesterday) {
    if (daysOfWeek.includes(cursor.getUTCDay())) out.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

async function submitEvidenceAt(
  goalId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  proofData: string,
  submittedAt: Date,
  status: "pending" | "verified" = "verified",
  subtaskId?: mongoose.Types.ObjectId,
) {
  const doc = await Evidence.create({ goalId, subtaskId, userId, proofData, status });
  // The schema auto-stamps submittedAt on insert; overwrite it via a follow-up
  // update so seeded activity lands on the historical date it's meant to represent.
  await Evidence.updateOne({ _id: doc._id }, { $set: { submittedAt } });
  return doc;
}

const PLACEHOLDER_IMAGE = "/uploads/seed-proof.png";

async function main() {
  await connectDatabase(process.env.MONGO_URI ?? "");

  const SEED_EMAILS = [
    "alex@stakedemo.dev",
    "jordan@stakedemo.dev",
    "sam@stakedemo.dev",
    "priya@stakedemo.dev",
    "marcus@stakedemo.dev",
    "taylor@stakedemo.dev",
  ];

  // --- Clean up any previous run of THIS script only ---------------------
  const existing = await User.find({ email: { $in: SEED_EMAILS } }).select("_id");
  const existingIds = existing.map((u) => u._id);
  if (existingIds.length > 0) {
    await Promise.all([
      Evidence.deleteMany({ userId: { $in: existingIds } }),
      FailureReport.deleteMany({ userId: { $in: existingIds } }),
      Goal.deleteMany({ creatorId: { $in: existingIds } }),
      FriendRequest.deleteMany({
        $or: [{ sender: { $in: existingIds } }, { receiver: { $in: existingIds } }],
      }),
      User.deleteMany({ _id: { $in: existingIds } }),
    ]);
    console.log(`Cleared ${existingIds.length} previously-seeded demo users and their data.`);
  }

  // --- Users ---------------------------------------------------------------
  const passwordHash = await hashPassword(SEED_PASSWORD);
  const userInputs = [
    { fullName: "Alex Rivera", username: "alexr", email: "alex@stakedemo.dev" },
    { fullName: "Jordan Blake", username: "jblake", email: "jordan@stakedemo.dev" },
    { fullName: "Sam Okafor", username: "sokafor", email: "sam@stakedemo.dev" },
    { fullName: "Priya Nair", username: "priyan", email: "priya@stakedemo.dev" },
    { fullName: "Marcus Chen", username: "mchen", email: "marcus@stakedemo.dev" },
    { fullName: "Taylor Brooks", username: "tbrooks", email: "taylor@stakedemo.dev" },
  ];

  const created: Record<string, IUserDocument> = {};
  for (const u of userInputs) {
    const doc = await User.create({ ...u, password: passwordHash, score: 0 });
    const key = u.username.replace(/[^a-z]/gi, "");
    created[u.email.split("@")[0]] = doc;
  }
  const [alex, jordan, sam, priya, marcus, taylor] = SEED_EMAILS.map(
    (e) => created[e.split("@")[0]],
  );

  const score: Record<string, number> = {};
  const bump = (user: IUserDocument, delta: number) => {
    const id = user._id.toString();
    score[id] = (score[id] ?? 0) + delta;
  };

  // --- Friendships -----------------------------------------------------------
  async function makeFriends(a: IUserDocument, b: IUserDocument) {
    await User.updateOne({ _id: a._id }, { $addToSet: { friends: b._id } });
    await User.updateOne({ _id: b._id }, { $addToSet: { friends: a._id } });
    await FriendRequest.create({ sender: a._id, receiver: b._id, status: "accepted" });
  }
  async function pendingRequest(sender: IUserDocument, receiver: IUserDocument) {
    await FriendRequest.create({ sender: sender._id, receiver: receiver._id, status: "pending" });
  }

  await makeFriends(alex, jordan);
  await makeFriends(alex, sam);
  await makeFriends(alex, priya);
  await makeFriends(jordan, marcus);
  await makeFriends(sam, priya);
  await pendingRequest(marcus, alex); // shows up in Alex's incoming requests
  await pendingRequest(taylor, priya); // shows up in Priya's incoming requests

  // --- Alex: the polished demo account --------------------------------------
  const gA1 = await TaskGoal.create({
    creatorId: alex._id,
    title: "Finish Q3 project proposal",
    description: "Draft and send the proposal doc to the team.",
    goalType: "task",
    endDate: daysAgo(6),
    status: "completed",
    daysOfWeek: [],
    stakeholders: [],
  });
  await submitEvidenceAt(gA1._id, alex._id, PLACEHOLDER_IMAGE, daysAgo(6), "verified");
  bump(alex, 10);

  const gA2StartDate = daysAgo(4);
  const gA2DaysOfWeek = [1, 3, 5]; // Mon / Wed / Fri
  const gA2Occurrences = elapsedOccurrences(gA2StartDate, gA2DaysOfWeek);
  const gA2Penalized = gA2Occurrences.slice(0, 1); // earliest elapsed run: missed
  const gA2Submitted = gA2Occurrences.slice(1); // the rest: submitted
  const gA2 = await TaskGoal.create({
    creatorId: alex._id,
    title: "Morning 5k run",
    description: "Lace up before breakfast — Mon / Wed / Fri.",
    goalType: "task",
    startDate: gA2StartDate,
    endDate: daysFromNow(10),
    status: "in_progress",
    daysOfWeek: gA2DaysOfWeek,
    penalizedDates: gA2Penalized,
    stakeholders: [],
  });
  for (const [i, d] of gA2Submitted.entries()) {
    await submitEvidenceAt(gA2._id, alex._id, PLACEHOLDER_IMAGE, d, i % 2 === 0 ? "verified" : "pending");
    bump(alex, 10);
  }
  if (gA2Penalized.length > 0) bump(alex, -5);
  // Also seed a couple of extra, more-recent days so Alex has a visible streak
  // (streak counts ANY submission day, across all goals).
  await submitEvidenceAt(gA2._id, alex._id, PLACEHOLDER_IMAGE, daysAgo(0), "verified");
  await submitEvidenceAt(gA2._id, alex._id, PLACEHOLDER_IMAGE, daysAgo(1), "verified");
  bump(alex, 20);

  const gA3 = await ProjectGoal.create({
    creatorId: alex._id,
    title: "Launch personal portfolio site",
    description: "Design, build, and ship a personal site.",
    goalType: "project",
    startDate: daysAgo(15),
    endDate: daysFromNow(20),
    status: "in_progress",
    stakeholders: [],
    subtasks: [
      { title: "Design mockup in Figma", deadline: daysAgo(8), deadlinePenaltyApplied: true },
      { title: "Build homepage", deadline: daysFromNow(4), deadlinePenaltyApplied: false },
      { title: "Deploy to production", deadline: daysFromNow(18), deadlinePenaltyApplied: false },
    ],
  });
  bump(alex, -5); // the missed "Design mockup" subtask

  const gA4Date = daysAgo(9);
  const gA4 = await TaskGoal.create({
    creatorId: alex._id,
    title: "Read \"Atomic Habits\"",
    description: "Finish the book and jot down three takeaways.",
    goalType: "task",
    endDate: gA4Date,
    status: "failed",
    daysOfWeek: [],
    penalizedDates: [gA4Date],
    stakeholders: [],
  });
  bump(alex, -5);
  await FailureReport.create({
    goalId: gA4._id,
    userId: alex._id,
    occurrenceDate: gA4Date,
    reason: "Got busy with work travel and never picked the book back up.",
  });
  // gA2's missed run and gA3's missed subtask are left UNREPORTED on purpose,
  // so the "report failure" flow has something live to try in the demo.

  // --- Jordan ----------------------------------------------------------------
  const gJ1 = await TaskGoal.create({
    creatorId: jordan._id,
    title: "Submit tax documents",
    goalType: "task",
    endDate: daysAgo(3),
    status: "completed",
    daysOfWeek: [],
    stakeholders: [],
  });
  await submitEvidenceAt(gJ1._id, jordan._id, PLACEHOLDER_IMAGE, daysAgo(3), "pending");
  bump(jordan, 10);

  const gJ2Date = daysAgo(4);
  const gJ2 = await TaskGoal.create({
    creatorId: jordan._id,
    title: "Clean out the garage",
    goalType: "task",
    endDate: gJ2Date,
    status: "failed",
    daysOfWeek: [],
    penalizedDates: [gJ2Date],
    stakeholders: [],
  });
  bump(jordan, -5);
  await FailureReport.create({
    goalId: gJ2._id,
    userId: jordan._id,
    occurrenceDate: gJ2Date,
    reason: "Ran out of time over the weekend — rescheduling for next month.",
  });

  const gJ3 = await ProjectGoal.create({
    creatorId: jordan._id,
    title: "Redesign resume",
    goalType: "project",
    startDate: daysAgo(10),
    endDate: daysFromNow(9),
    status: "in_progress",
    stakeholders: [],
    subtasks: [
      { title: "Draft content", deadline: daysAgo(2), deadlinePenaltyApplied: false },
      { title: "Get feedback from 3 people", deadline: daysFromNow(5), deadlinePenaltyApplied: false },
    ],
  });
  const jordanDraftSubtask = gJ3.subtasks[0]._id;
  await submitEvidenceAt(gJ3._id, jordan._id, PLACEHOLDER_IMAGE, daysAgo(2), "verified", jordanDraftSubtask);
  bump(jordan, 10);

  // --- Sam ---------------------------------------------------------------
  const gS1StartDate = daysAgo(4);
  const gS1DaysOfWeek = [2, 4, 6]; // Tue / Thu / Sat
  const gS1Occurrences = elapsedOccurrences(gS1StartDate, gS1DaysOfWeek);
  const gS1 = await TaskGoal.create({
    creatorId: sam._id,
    title: "Practice guitar",
    goalType: "task",
    startDate: gS1StartDate,
    endDate: daysFromNow(12),
    status: "in_progress",
    daysOfWeek: gS1DaysOfWeek,
    stakeholders: [],
  });
  for (const d of gS1Occurrences) {
    await submitEvidenceAt(gS1._id, sam._id, PLACEHOLDER_IMAGE, d, "verified");
    bump(sam, 10);
  }

  const gS2Date = daysAgo(5);
  const gS2 = await TaskGoal.create({
    creatorId: sam._id,
    title: "Fix the leaky faucet",
    goalType: "task",
    endDate: gS2Date,
    status: "failed",
    daysOfWeek: [],
    penalizedDates: [gS2Date],
    stakeholders: [],
  });
  bump(sam, -5); // left unreported — Sam hasn't gotten around to explaining this one

  // --- Priya ---------------------------------------------------------------
  const gP1 = await ProjectGoal.create({
    creatorId: priya._id,
    title: "Plan community fundraiser",
    goalType: "project",
    startDate: daysAgo(12),
    endDate: daysFromNow(15),
    status: "in_progress",
    stakeholders: [],
    subtasks: [
      { title: "Book venue", deadline: daysAgo(6), deadlinePenaltyApplied: false },
      { title: "Send invitations", deadline: daysFromNow(3), deadlinePenaltyApplied: false },
      { title: "Confirm catering", deadline: daysFromNow(10), deadlinePenaltyApplied: false },
    ],
  });
  const priyaVenueSubtask = gP1.subtasks[0]._id;
  await submitEvidenceAt(gP1._id, priya._id, PLACEHOLDER_IMAGE, daysAgo(6), "verified", priyaVenueSubtask);
  bump(priya, 10);

  const gP2 = await TaskGoal.create({
    creatorId: priya._id,
    title: "Complete online course module",
    goalType: "task",
    endDate: daysAgo(1),
    status: "completed",
    daysOfWeek: [],
    stakeholders: [],
  });
  await submitEvidenceAt(gP2._id, priya._id, PLACEHOLDER_IMAGE, daysAgo(1), "pending");
  bump(priya, 10);

  // --- Marcus ---------------------------------------------------------------
  await TaskGoal.create({
    creatorId: marcus._id,
    title: "Organize garage sale",
    goalType: "task",
    endDate: daysFromNow(5),
    status: "in_progress",
    daysOfWeek: [],
    stakeholders: [],
  });

  const gM2Date = daysAgo(2);
  const gM2 = await TaskGoal.create({
    creatorId: marcus._id,
    title: "File expense report",
    goalType: "task",
    endDate: gM2Date,
    status: "failed",
    daysOfWeek: [],
    penalizedDates: [gM2Date],
    stakeholders: [],
  });
  bump(marcus, -5);
  await FailureReport.create({
    goalId: gM2._id,
    userId: marcus._id,
    occurrenceDate: gM2Date,
    reason: "Missing a few receipts, need to track them down.",
  });

  // --- Taylor: brand-new account, mostly empty on purpose ---------------
  await TaskGoal.create({
    creatorId: taylor._id,
    title: "Set up home workspace",
    goalType: "task",
    endDate: daysFromNow(6),
    status: "in_progress",
    daysOfWeek: [],
    stakeholders: [],
  });

  // --- Apply final scores -----------------------------------------------
  await Promise.all(
    Object.entries(score).map(([id, total]) => User.updateOne({ _id: id }, { $set: { score: total } })),
  );

  console.log("\nSeed complete. Demo accounts (all use the same password):\n");
  console.log(`  password: ${SEED_PASSWORD}\n`);
  for (const u of userInputs) {
    const doc = created[u.email.split("@")[0]];
    console.log(`  ${u.email.padEnd(24)} @${u.username.padEnd(10)} score=${score[doc._id.toString()] ?? 0}`);
  }
  console.log("\nSign in as alex@stakedemo.dev for the fullest demo (friends, feed, leaderboard, history).\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
