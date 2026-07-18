import express, { type Express } from "express";
import { env } from "./config/env.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import userRoutes from "./routes/user.routes.js";
import reportRoutes from "./routes/report.routes.js";


const app: Express = express();
app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use('/api/auth',authRoutes)
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorMiddleware);



export default app;