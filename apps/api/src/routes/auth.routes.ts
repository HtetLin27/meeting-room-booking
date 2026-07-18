import { Router } from "express";
import { loginController, getMeController, logoutController } from "../controllers/auth.controller.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.post(
  "/login",
  validate(loginSchema),
  loginController
);

router.get(
  "/me",
  authenticate,
  getMeController
)

router.post(
  "/logout",
  logoutController
);
export default router;