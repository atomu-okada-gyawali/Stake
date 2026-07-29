// One-off maintenance script: removes circle-feed posts (Evidence docs) that
// have no real photo/video — i.e. proofData that is empty, not an /uploads/
// path, or pointing at a file that no longer exists in backend/uploads.
//
// Usage:
//   npx ts-node src/scripts/removeNoPhotoEvidence.ts          (dry run, lists only)
//   npx ts-node src/scripts/removeNoPhotoEvidence.ts --delete (actually deletes)

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { Evidence } from "../models/Evidence";

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
const MEDIA_EXT = /\.(jpe?g|png|gif|webp|mp4|mov|avi|webm)$/i;

function hasPhoto(proofData: string | undefined | null): boolean {
  if (!proofData || !proofData.startsWith("/uploads/")) return false;
  if (!MEDIA_EXT.test(proofData)) return false;
  return fs.existsSync(path.join(UPLOADS_DIR, proofData.replace("/uploads/", "")));
}

async function main() {
  const doDelete = process.argv.includes("--delete");
  await connectDatabase(process.env.MONGO_URI ?? "");

  const all = await Evidence.find({}).select("_id proofData").lean();
  const noPhoto = all.filter((doc) => !hasPhoto(doc.proofData));

  console.log(`${all.length} evidence docs total, ${noPhoto.length} without a photo:`);
  for (const doc of noPhoto) {
    console.log(`  ${doc._id}  proofData=${JSON.stringify(doc.proofData)}`);
  }

  if (doDelete && noPhoto.length > 0) {
    const res = await Evidence.deleteMany({ _id: { $in: noPhoto.map((d) => d._id) } });
    console.log(`\nDeleted ${res.deletedCount} evidence docs.`);
  } else if (!doDelete) {
    console.log("\nDry run only — re-run with --delete to remove them.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
