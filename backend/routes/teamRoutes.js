import express from "express";

const router = express.Router();

router.get("/", getTeams);
router.post("/", createTeam);
router.get("/:_id", getTeam);
router.patch("/:_id", updateTeam);
router.delete("/:_id", deleteTeam);

export default router;