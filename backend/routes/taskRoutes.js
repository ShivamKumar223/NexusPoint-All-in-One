import express from "express";

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:project/:module/:task", updateTask);
router.get("/:project/:module/:task", getTask);
router.patch("/:project/:module/:task", deleteTask);

export default router;
