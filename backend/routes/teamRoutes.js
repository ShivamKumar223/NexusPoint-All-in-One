import express from "express";

const router = express.Router();

router.get("/", getTeams);
router.post("/", createTeam);
router.patch("/:team", updateTeam);
router.get("/:team", getTeam);
router.delete("/:team", deleteTeam);

export default router;