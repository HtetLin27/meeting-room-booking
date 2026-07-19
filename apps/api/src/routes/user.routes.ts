import { Router } from "express";
import { Role } from "../generated/prisma/client.js";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  updateUserRoleController,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createUserSchema,
  updateUserRoleSchema,
} from "../schemas/user.schema.js";

const router: Router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get("/", getAllUsersController);

router.post("/", validate(createUserSchema), createUserController);

router.patch(
  "/:id/role",
  validate(updateUserRoleSchema),
  updateUserRoleController
);

router.delete("/:id", deleteUserController);

export default router;
