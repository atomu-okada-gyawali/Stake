// 1. Core Node and config modules first
import dns from "node:dns";
import dotenv from "dotenv";

// 2. Execute DNS and Env configuration immediately before other imports run
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

// 3. Now import your third-party and local modules
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import path from "node:path";
import { connectDatabase } from "./config/database";
import authRouter from "./routes/auth.routes";
import goalRouter from "./routes/goal.routes";
import friendRouter from "./routes/friend.routes";
import evidenceRouter from "./routes/evidence.routes";
import failureReportRouter from "./routes/failureReport.routes";
import statsRouter from "./routes/stats.routes";

const app = express();
const PORT = process.env.PORT ?? "4000";

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/goals", goalRouter);
app.use("/api/friends", friendRouter);
app.use("/api/evidence", evidenceRouter);
app.use("/api/failures", failureReportRouter);
app.use("/api/stats", statsRouter);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({ message: err.message ?? "Internal server error" });
};

app.use(errorHandler);

// Note: Ensure your .env file uses MONGO_URI to match this variable name
connectDatabase(process.env.MONGO_URI ?? "")
  .then(() => {
    app.listen(Number(PORT), () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
