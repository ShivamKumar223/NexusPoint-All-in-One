import express from "express";
import { loginOrganization, registerOrganization, updatePassword } from "../controllers/organizationAuthentication.js";
import { createMember, deleteMember, getAllProjects, getAllTeams, getMembers, getProfile, getProjectById, getTeamById, updateMember } from "../controllers/masterAdmin.js";
import { authMiddleware } from "../middleware/tokenVerification.js";



const router = express.Router();

router.post("/register", registerOrganization);
router.post("/login", loginOrganization);

router.use(authMiddleware);    //middleware for verify token

router.get("/profile", getProfile);

router.patch("/update-password", updatePassword);

router.get("/members", getMembers);
router.post("/member", createMember);
router.patch("/member/:memberId", updateMember);
router.delete("/member/:memberId", deleteMember);

router.get("/teams", getAllTeams);
router.get("/team/:teamId", getTeamById);

router.get("/projects", getAllProjects);
router.get("/project/:projectId", getProjectById);


export default router;