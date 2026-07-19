import { Router } from "express";
import { Role } from "../generated/prisma/client.js";
import { getUsageReportController } from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router: Router = Router();

router.get(
  "/usage",
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  getUsageReportController
);

export default router;
