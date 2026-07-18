import { Router } from "express";
import { loginController } from "../controllers/auth.controller.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { validate } from "../middleware/validate.middleware.js";

const router: Router = Router();

router.post(
  "/login",
  validate(loginSchema),
  loginController
);

export default router;