import express from "express";

const router = express.Router();

router.get("/", getModules);
router.post("/:project", createModule);
router.patch("/:project/:module", updateModule);
router.patch("/:project/:module", updateModule);
router.delete("/:project/:module", deleteModule);

export default router;