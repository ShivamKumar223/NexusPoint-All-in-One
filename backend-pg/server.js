import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import pool from "./config/db.js";
import createAllTables from "./models/index.js";
import { queryOne, query } from "./utils/query.js";
import { addId } from "./utils/addId.js";

import masterAdminRoutes from "./routes/masterAdminRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import pmRoutes from "./routes/projectManagerRoutes.js";
import tmownerRoutes from "./routes/teamOwnerRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(express.json());

const corsOptions = {
  origin: ["https://nexuspoint-pg.netlify.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Socket.io setup
const io = new Server(httpServer, { cors: corsOptions });

// Socket.io auth middleware
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie?.split("token=")[1]?.split(";")[0];
    if (!token) return next(new Error("Authentication error"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Track online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.user.userId || socket.user.organizationId;
  onlineUsers.set(userId, socket.id);

  io.emit("user-online", userId);

  socket.on("join-chats", async (chatIds) => {
    if (Array.isArray(chatIds)) {
      chatIds.forEach((id) => socket.join(String(id)));
    }
  });

  socket.on("join-room", (roomId) => {
    socket.join(String(roomId));
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(String(roomId));
  });

  // Send message via socket
  socket.on("send-message", async (data) => {
    try {
      const { groupId, content } = data;

      // Verify membership
      const group = await queryOne(
        `SELECT * FROM "chat_groups" WHERE "id" = $1 AND $2 = ANY("members")`,
        [groupId, userId]
      );
      if (!group) return;

      const message = await queryOne(
        `INSERT INTO "chat_messages" ("groupId","senderId","content","messageType","readBy")
         VALUES ($1,$2,$3,'text',$4::bigint[]) RETURNING *`,
        [groupId, userId, content.trim(), [userId]]
      );

      await pool.query(
        `UPDATE "chat_groups" SET "updatedAt" = NOW() WHERE "id" = $1`,
        [groupId]
      );

      // Populate sender
      const sender = await queryOne(
        `SELECT "id","name","memberId","role","designation"
         FROM "members" WHERE "id" = $1`,
        [userId]
      );

      const msgJson = addId({ ...message, sender: sender ? addId(sender) : null });

      // Emit to all members in the room
      io.to(String(groupId)).emit("message-received", msgJson);

      // Notify members not in the room
      (group.members || []).forEach((memberId) => {
        if (memberId !== userId) {
          const memberSocketId = onlineUsers.get(memberId);
          if (memberSocketId) {
            io.to(memberSocketId).emit("new-message-notification", {
              groupId,
              message: msgJson,
            });
          }
        }
      });
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(String(data.groupId)).emit("user-typing", {
      groupId: data.groupId,
      userId,
      userName: socket.user.name,
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(String(data.groupId)).emit("user-stop-typing", {
      groupId: data.groupId,
      userId,
    });
  });

  // Mark messages as read
  socket.on("mark-read", async (groupId) => {
    try {
      await pool.query(
        `UPDATE "chat_messages" SET "readBy" = array_append("readBy", $1)
         WHERE "groupId" = $2 AND NOT ("readBy" @> ARRAY[$1]::bigint[])`,
        [parseInt(userId), parseInt(groupId)]
      );
      socket.to(String(groupId)).emit("messages-read", { groupId, userId });
    } catch (err) {
      // silent fail
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("user-offline", userId);
  });
});

app.use(cookieParser());

app.get("/", (req, res) => {
  res.end("Welcome to DevColab (PostgreSQL)");
});

app.use("/api/master-admin", masterAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/project-manager", pmRoutes);
app.use("/api/team-owner", tmownerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 7000;

// Connect DB → Create Tables → Start Server
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection verified.");

    // Auto-create all tables on startup
    await createAllTables();

    httpServer.listen(PORT, () => {
      console.log(`Server run on PORT : ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
})();
