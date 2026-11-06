import express from "express";
import { getMyTasks, getMyTeams, getProfile, updateTaskStatus } from "../controllers/employee.js";
import { loginMember, updatePassword } from "../controllers/memberAuthentication.js";
import { authMiddleware } from "../middleware/tokenVerification.js";

const router = express.Router();

router.post("/login", loginMember);

router.use(authMiddleware);

router.get("/profile", getProfile);

router.patch("/update-password", updatePassword);

router.get("/team", getMyTeams);

router.get("/tasks", getMyTasks);

router.patch("/update", updateTaskStatus);

export default router;
