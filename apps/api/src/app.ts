import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use('/api/auth',authRoutes)

app.use(errorMiddleware);



export default app;