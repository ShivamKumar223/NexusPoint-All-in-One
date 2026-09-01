import express from "express";

import {registerAdmin, loginAdmin } from "../controllers/adminAuthentication.js"
import { deleteMember, getMembers, getProfile, registerMember, updateMember } from "../controllers/adminFunctions.js";
import { authMiddleware } from "../middleware/tokenVerification.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.use(authMiddleware);    //middleware for verify token

router.get("/profile", getProfile);

router.get("/members", getMembers);
router.post("/member", registerMember);
router.patch("/member/:memberId", updateMember);
router.delete("/member/:memberId", deleteMember);


export default router;