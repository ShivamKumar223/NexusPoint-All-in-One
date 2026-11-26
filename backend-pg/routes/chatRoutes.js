import express from "express";
import { authMiddleware } from "../middleware/tokenVerification.js";
import {
  getAllMembers,
  getOrCreateDirectChat,
  createGroup,
  updateGroup,
  deleteGroup,
  getMyChats,
  getMessages,
  sendMessage,
  getMemberDetail,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/members", getAllMembers);
router.get("/member/:memberId", getMemberDetail);
router.get("/conversations", getMyChats);
router.post("/direct/:memberId", getOrCreateDirectChat);
router.post("/group", createGroup);
router.patch("/group/:groupId", updateGroup);
router.delete("/group/:groupId", deleteGroup);
router.get("/messages/:groupId", getMessages);
router.post("/messages/:groupId", sendMessage);

export default router;
