import express from "express";
import { loginMember } from "../controllers/memberAuthentication.js";
import { authMiddleware } from "../middleware/tokenVerification.js";
import {
    getProfile, getAllOrgMembers, getAllOrgTeams,
    createTeam, updateTeam, deleteTeam, getTeamById, getAllTeams,
    createProject, updateProject, deleteProject, getAllProjects, getProjectById, updateProjectStatus,
    createModule, updateModule, deleteModule, getAllModulesByProjectId
} from "../controllers/projectManagerFunctions.js";

const router = express.Router();

router.post("/login", loginMember);

router.use(authMiddleware);

router.get("/profile", getProfile);
router.get("/org-members", getAllOrgMembers);
router.get("/org-teams", getAllOrgTeams);

router.post("/team", createTeam);
router.patch("/team/:teamId", updateTeam);
router.delete("/team/:teamId", deleteTeam);
router.get("/team/:teamId", getTeamById);
router.get("/teams", getAllTeams);

router.post("/project", createProject);
router.patch("/project/:projectId", updateProject);
router.delete("/project/:projectId", deleteProject);
router.get("/project/:projectId", getProjectById);
router.get("/projects", getAllProjects);
router.patch("/project-status/:projectId", updateProjectStatus);

router.post("/module/:projectId", createModule);
router.patch("/module/:moduleId", updateModule);
router.delete("/module/:moduleId", deleteModule);
router.get("/modules/:projectId", getAllModulesByProjectId);

export default router;
