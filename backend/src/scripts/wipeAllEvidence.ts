// One-off maintenance script: removes EVERY evidence post (seed and real) so
// the feed can be rebuilt from a clean slate. Run seed.ts afterwards.
//
// Usage: npx ts-node src/scripts/wipeAllEvidence.ts

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { Evidence } from "../models/Evidence";

async function main() {
  await connectDatabase(process.env.MONGO_URI ?? "");
  const res = await Evidence.deleteMany({});
  console.log(`Deleted ${res.deletedCount} evidence posts.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Wipe failed:", err);
  process.exit(1);
});
