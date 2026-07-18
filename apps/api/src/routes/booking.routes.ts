import { Router } from "express";
import {
  createBookingController,
  getAllBookingsController,
  deleteBookingController
} from "../controllers/booking.controller.js";
import { createBookingSchema } from "../schemas/booking.schema.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  getAllBookingsController
);

router.post(
  "/",
  authenticate,
  validate(createBookingSchema),
  createBookingController
);

router.delete(
  "/:id",
  authenticate,
  deleteBookingController
);
export default router;