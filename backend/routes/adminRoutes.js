import express from "express";

import { loginOrganization, registerOrganization } from "../controllers/organizationAuthentication.js"
import { deleteMember, getMembers, getProfile, registerMember, updateMember } from "../controllers/adminFunctions.js";
import { authMiddleware } from "../middleware/tokenVerification.js";

const router = express.Router();

router.post("/register", registerOrganization);
router.post("/login", loginOrganization);

router.use(authMiddleware);    //middleware for verify token

router.get("/profile", getProfile);

router.get("/members", getMembers);
router.post("/member", registerMember);
router.patch("/member/:_id", updateMember);
router.delete("/member/:_id", deleteMember);


export default router;