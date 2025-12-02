import { Router } from "express";
import appointmentsController from "../controllers/appointmentsController.js";
import checkAuth from "../middlewares/checkAuth.js";

const router = Router();

router.post("/api/appointments", checkAuth, appointmentsController.schedule);
router.get("/api/appointments", checkAuth, appointmentsController.appointments);
router.delete("/api/appointments/:id", checkAuth, appointmentsController.delete);
router.put("/api/appointments/:id", checkAuth, appointmentsController.conclude);

export default router;
