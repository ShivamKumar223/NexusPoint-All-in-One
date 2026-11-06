import express from "express";
import { createTask, deleteTask, getAllTasksByModoleId, getMyModules, getMyTeams, getProfile, updateModuleStatus, updateTask } from "../controllers/teamOwner.js";
import { loginMember } from "../controllers/memberAuthentication.js";
import { authMiddleware } from "../middleware/tokenVerification.js";

const router = express.Router();

router.post("/login", loginMember);

router.use(authMiddleware);

router.get("/profile", getProfile);

router.get("/modules", getMyModules);
router.patch("/module/:moduleId", updateModuleStatus);

router.post("/task/:moduleId", createTask);
router.patch("/task/:taskId", updateTask);
router.delete("/task/:taskId", deleteTask);
router.get("/tasks/:moduleId", getAllTasksByModoleId);

router.get("/team", getMyTeams);

export default router;
