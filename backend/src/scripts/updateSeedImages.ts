// One-off maintenance script: gives the @stakedemo.dev demo accounts real
// profile pictures and replaces the broken /uploads/seed-proof.png evidence
// placeholder with the actual proof photos now stored in backend/uploads.
//
// Safe to re-run: only touches seed accounts and evidence still pointing at
// the old placeholder.
//
// Usage: npx ts-node src/scripts/updateSeedImages.ts

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { User } from "../models/User";
import { Evidence } from "../models/Evidence";

const AVATARS: Record<string, string> = {
  alexr: "/uploads/seed-avatar-alexr.jpg",
  jblake: "/uploads/seed-avatar-jblake.jpg",
  sokafor: "/uploads/seed-avatar-sokafor.jpg",
  priyan: "/uploads/seed-avatar-priyan.jpg",
  mchen: "/uploads/seed-avatar-mchen.jpg",
  tbrooks: "/uploads/seed-avatar-tbrooks.jpg",
};

const OLD_PLACEHOLDER = "/uploads/seed-proof.png";
const PROOF_PHOTOS = Array.from({ length: 8 }, (_, i) => `/uploads/seed-proof-${i + 1}.jpg`);

async function main() {
  await connectDatabase(process.env.MONGO_URI ?? "");

  let avatarCount = 0;
  for (const [username, avatarUrl] of Object.entries(AVATARS)) {
    const res = await User.updateOne({ username }, { $set: { avatarUrl } });
    if (res.matchedCount > 0) avatarCount++;
    console.log(`${res.matchedCount > 0 ? "updated" : "skipped (not found)"}  @${username} -> ${avatarUrl}`);
  }

  const stale = await Evidence.find({ proofData: OLD_PLACEHOLDER }).select("_id").sort({ _id: 1 });
  for (const [i, doc] of stale.entries()) {
    await Evidence.updateOne(
      { _id: doc._id },
      { $set: { proofData: PROOF_PHOTOS[i % PROOF_PHOTOS.length] } },
    );
  }

  console.log(`\nDone: ${avatarCount} avatars set, ${stale.length} evidence photos replaced.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
