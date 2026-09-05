import express from "express";

const router = express.Router();

//Project manager's function related to project
router.get("/", getProjects);
router.post("/", createProject);
router.patch("/", updateProject);
router.get("/:project", getProject);
router.delete("/:project", deleteProject);

export default router;