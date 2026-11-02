import express from "express";

const router = express.Router();

router.get("/", getModules);
router.post("/", createModule);
router.patch("/:_id", getModule);
router.patch("/:_id", updateModule);
router.delete("/:_id", deleteModule);

export default router;