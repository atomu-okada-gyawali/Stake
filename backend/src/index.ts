import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import authRouter from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? "4000";

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({ message: err.message ?? "Internal server error" });
};

app.use(errorHandler);

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
