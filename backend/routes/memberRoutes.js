import express from "express";
import { loginMember } from "../controllers/memberAuthentication.js";
import { authMiddleware } from "../middleware/tokenVerification.js";
import { getProfile } from "../controllers/memberFunctions.js";

const router = express.Router();

router.post("/login", loginMember);

router.use(authMiddleware);

router.get("/profile", getProfile);


export default router;