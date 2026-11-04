import express from "express";
import { getMyTasks, getMyTeams, getProfile, updateTaskStatus } from "../controllers/employee";

const router = express.Router();

router.get("/profile", getProfile);

router.get("/team", getMyTeams);

router.ger("/tasks", getMyTasks);

router.patch("/update", updateTaskStatus);

export default router;