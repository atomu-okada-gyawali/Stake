import mongoose from "mongoose";

export async function connectDatabase(uri: string): Promise<void> {
  if (!uri) {
    throw new Error("MONGO_URI environment variable is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: "stake",
  });

  console.log("Connected to MongoDB");
}
