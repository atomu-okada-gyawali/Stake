// One-off maintenance script: removes friend list entries and friend requests
// that point at users who no longer exist (e.g. after seed accounts were
// wiped and recreated with new ids).
//
// Usage: npx ts-node src/scripts/pruneDanglingFriends.ts

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { User } from "../models/User";
import { FriendRequest } from "../models/FriendRequest";

async function main() {
  await connectDatabase(process.env.MONGO_URI ?? "");

  const existingIds = new Set(
    (await User.find({}).select("_id")).map((u) => u._id.toString()),
  );

  let pruned = 0;
  const users = await User.find({}).select("username friends");
  for (const user of users) {
    const dangling = user.friends.filter((f) => !existingIds.has(f.toString()));
    if (dangling.length === 0) continue;
    await User.updateOne({ _id: user._id }, { $pull: { friends: { $in: dangling } } });
    pruned += dangling.length;
    console.log(`@${user.username}: removed ${dangling.length} dangling friend ref(s)`);
  }

  const reqRes = await FriendRequest.deleteMany({
    $or: [
      { sender: { $nin: [...existingIds] } },
      { receiver: { $nin: [...existingIds] } },
    ],
  });

  console.log(`\nDone: ${pruned} friend refs pruned, ${reqRes.deletedCount} orphaned requests deleted.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Prune failed:", err);
  process.exit(1);
});
