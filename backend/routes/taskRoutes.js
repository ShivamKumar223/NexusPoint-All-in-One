import express from "express";

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:_id", getTask);
router.patch("/:_id", updateTask);
router.patch("/:_id", deleteTask);

export default router;
