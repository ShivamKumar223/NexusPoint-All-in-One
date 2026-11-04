import express from "express";
import { createTask, deleteTask, getAllTasksByModoleId, getMyModules, getMyTeams, getProfile, updateModuleStatus, updateTask } from "../controllers/teamOwner";

const router = express.Router();

router.get("/profile", getProfile);

router.get("/modules", getMyModules);
router.get("/module", updateModuleStatus);

router.post("/task/:moduleId", createTask);
router.patch("/task/:taskId", updateTask);
router.delete("/:task", deleteTask);
router.get("/tasks/:moduleId", getAllTasksByModoleId);

router.get("/team", getMyTeams);


export default router;