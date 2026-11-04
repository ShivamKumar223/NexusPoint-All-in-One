import express from "express";

import { loginOrganization, registerOrganization } from "../controllers/organizationAuthentication.js"
import {getProfile, createMember, updateMember, deleteMember, getMembers, getAllTeams, getTeamById, getAllProjects, getProjectById, } from "../controllers/adminFunctions.js";
import { authMiddleware } from "../middleware/tokenVerification.js";

const router = express.Router();

router.post("/register", registerOrganization);
router.post("/login", loginOrganization);

router.use(authMiddleware);    //middleware for verify token

router.get("/profile", getProfile);

router.get("/members", getMembers);
router.post("/member", createMember);
router.patch("/member/:_id", updateMember);
router.delete("/member/:_id", deleteMember);
router.get("/teams", getAllTeams);
router.get("/team/:teamId", getTeamById);
router.get("/projects", getAllProjects);
router.get("/project/:projectId", getProjectById);


export default router;