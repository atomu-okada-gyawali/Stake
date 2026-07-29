// One-off maintenance script: every user without an avatarUrl gets a generated
// initials avatar (SVG written to backend/uploads) so no profile renders blank.
//
// Safe to re-run: only touches users whose avatarUrl is missing/empty.
//
// Usage: npx ts-node src/scripts/addMissingAvatars.ts

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { User } from "../models/User";

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

const PALETTE = [
  { bg: "#ABD600", fg: "#161E00" }, // stake accent
  { bg: "#7C3AED", fg: "#FFFFFF" },
  { bg: "#0EA5E9", fg: "#FFFFFF" },
  { bg: "#F59E0B", fg: "#1C1400" },
  { bg: "#EF4444", fg: "#FFFFFF" },
  { bg: "#10B981", fg: "#062B1F" },
  { bg: "#EC4899", fg: "#FFFFFF" },
  { bg: "#F97316", fg: "#1C0E00" },
];

function initialsOf(fullName: string | undefined, username: string): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  const source = parts[0] ?? username;
  return source.slice(0, 2).toUpperCase();
}

function colorFor(username: string) {
  let hash = 0;
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function avatarSvg(initials: string, username: string): string {
  const { bg, fg } = colorFor(username);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="${bg}"/>
  <text x="128" y="128" dy="0.36em" text-anchor="middle"
    font-family="Poppins, Arial, sans-serif" font-size="104" font-weight="700"
    fill="${fg}">${initials}</text>
</svg>
`;
}

async function main() {
  await connectDatabase(process.env.MONGO_URI ?? "");

  const users = await User.find({
    $or: [{ avatarUrl: { $exists: false } }, { avatarUrl: null }, { avatarUrl: "" }],
  }).select("username fullName");

  for (const user of users) {
    const fileName = `avatar-${user.username}.svg`;
    fs.writeFileSync(
      path.join(UPLOADS_DIR, fileName),
      avatarSvg(initialsOf(user.fullName, user.username), user.username),
    );
    await User.updateOne({ _id: user._id }, { $set: { avatarUrl: `/uploads/${fileName}` } });
    console.log(`@${user.username} -> /uploads/${fileName}`);
  }

  console.log(`\nDone: ${users.length} avatars generated.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Avatar backfill failed:", err);
  process.exit(1);
});
