import express from "express";

const router = express.Router();

//Project manager's function related to project
router.get("/", getProjects);
router.post("/", createProject);
router.patch("/", updateProject);
router.get("/:_id", getProject);
router.delete("/:_id", deleteProject);

export default router;