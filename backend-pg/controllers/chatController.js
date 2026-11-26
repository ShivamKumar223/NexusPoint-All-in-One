import pool from "../config/db.js";
import { query, queryOne } from "../utils/query.js";
import { addId } from "../utils/addId.js";

// Role hierarchy for group creation permissions
const ROLE_HIERARCHY = {
  "master-admin": ["admin", "project-manager", "team-owner", "developer"],
  admin: ["admin", "project-manager", "team-owner", "developer"],
  "project-manager": ["project-manager", "team-owner", "developer"],
  "team-owner": ["team-owner", "developer"],
  developer: ["developer"],
};

// Helper: get the user's ID
const getUserId = (user) => user.userId || user.organizationId;

// Helper: populate members array (replace integer IDs with member objects)
const populateGroupMembers = async (group) => {
  const json = { ...group };
  if (json.id !== undefined) json._id = json.id;

  if (json.members && json.members.length > 0) {
    const memberData = await query(
      `SELECT "id","name","memberId","role","designation","skills"
       FROM "members" WHERE "id" = ANY($1::bigint[])`,
      [json.members]
    );
    json.members = addId(memberData);
  }
  return json;
};

// Get all org members for contact list
export const getAllMembers = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const members = await query(
      `SELECT "id","name","memberId","role","designation","skills"
       FROM "members" WHERE "organizationId" = $1`,
      [orgId]
    );
    res.status(200).json({ data: addId(members) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get or create a direct message chat between two users
export const getOrCreateDirectChat = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = getUserId(req.user);
    const orgId = req.user.organizationId;

    if (String(userId) === String(memberId)) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check if DM already exists
    let chat = await queryOne(
      `SELECT * FROM "chat_groups"
       WHERE "organizationId" = $1
         AND "isDirectMessage" = true
         AND "members" @> ARRAY[$2,$3]::bigint[]
         AND array_length("members", 1) = 2`,
      [orgId, userId, parseInt(memberId)]
    );

    if (!chat) {
      const targetMember = await queryOne(
        `SELECT "id" FROM "members" WHERE "id" = $1 AND "organizationId" = $2`,
        [memberId, orgId]
      );
      if (!targetMember) return res.status(404).json({ message: "Member not found" });

      chat = await queryOne(
        `INSERT INTO "chat_groups" ("organizationId","isDirectMessage","members","createdBy")
         VALUES ($1,true,$2::bigint[],$3) RETURNING *`,
        [orgId, [userId, parseInt(memberId)], userId]
      );
    }

    const populated = await populateGroupMembers(chat);
    res.status(200).json({ data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a group chat
export const createGroup = async (req, res) => {
  try {
    const { groupName, description, memberIds } = req.body;
    const userId = getUserId(req.user);
    const orgId = req.user.organizationId;
    const userRole = req.user.role;

    if (!groupName || !memberIds || memberIds.length === 0) {
      return res.status(400).json({ message: "Group name and members are required" });
    }

    const allowedRoles = ROLE_HIERARCHY[userRole] || [];
    const membersToAdd = await query(
      `SELECT "id","role" FROM "members" WHERE "id" = ANY($1::bigint[]) AND "organizationId" = $2`,
      [memberIds, orgId]
    );

    for (const member of membersToAdd) {
      if (member.id !== userId && !allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: `You cannot add ${member.role} role members to your group` });
      }
    }

    const allMembers = [...new Set([userId, ...memberIds.map(Number)])];

    const group = await queryOne(
      `INSERT INTO "chat_groups" ("organizationId","groupName","description","isDirectMessage","members","createdBy","admins")
       VALUES ($1,$2,$3,false,$4::bigint[],$5,$6::bigint[]) RETURNING *`,
      [orgId, groupName, description || "", allMembers, userId, [userId]]
    );

    await queryOne(
      `INSERT INTO "chat_messages" ("groupId","senderId","content","messageType","readBy")
       VALUES ($1,$2,$3,'system',$4::bigint[]) RETURNING "id"`,
      [group.id, userId, `Group "${groupName}" was created`, [userId]]
    );

    const populated = await populateGroupMembers(group);
    res.status(201).json({ data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a group
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupName, description, memberIds } = req.body;
    const userId = getUserId(req.user);
    const userRole = req.user.role;
    const orgId = req.user.organizationId;

    const group = await queryOne(`SELECT * FROM "chat_groups" WHERE "id" = $1`, [groupId]);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.isDirectMessage) return res.status(400).json({ message: "Cannot update a direct chat" });

    const isAdmin = (group.admins || []).includes(userId) || group.createdBy === userId;
    if (!isAdmin) return res.status(403).json({ message: "Only group admins can update the group" });

    const newName = groupName || group.groupName;
    const newDesc = description !== undefined ? description : group.description;
    let newMembers = group.members;

    if (memberIds && Array.isArray(memberIds)) {
      const allowedRoles = ROLE_HIERARCHY[userRole] || [];
      const newMembersData = await query(
        `SELECT "id","role" FROM "members" WHERE "id" = ANY($1::bigint[]) AND "organizationId" = $2`,
        [memberIds, orgId]
      );
      for (const member of newMembersData) {
        if (member.id !== userId && !allowedRoles.includes(member.role)) {
          return res.status(403).json({ message: `You cannot add ${member.role} role members to your group` });
        }
      }
      newMembers = [...new Set([userId, ...memberIds.map(Number)])];
    }

    const updated = await queryOne(
      `UPDATE "chat_groups" SET "groupName"=$1,"description"=$2,"members"=$3::bigint[]
       WHERE "id"=$4 RETURNING *`,
      [newName, newDesc, newMembers, groupId]
    );

    const populated = await populateGroupMembers(updated);
    res.status(200).json({ data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a group
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = getUserId(req.user);

    const group = await queryOne(`SELECT * FROM "chat_groups" WHERE "id" = $1`, [groupId]);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.isDirectMessage) return res.status(400).json({ message: "Cannot delete a direct chat" });

    if (group.createdBy !== userId) {
      return res.status(403).json({ message: "Only the group creator can delete it" });
    }

    await pool.query(`DELETE FROM "chat_messages" WHERE "groupId" = $1`, [group.id]);
    await pool.query(`DELETE FROM "chat_groups" WHERE "id" = $1`, [group.id]);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations (DMs + groups) for current user
export const getMyChats = async (req, res) => {
  try {
    const userId = getUserId(req.user);

    const chats = await query(
      `SELECT * FROM "chat_groups"
       WHERE $1 = ANY("members")
       ORDER BY "updatedAt" DESC`,
      [userId]
    );

    const chatsWithMeta = await Promise.all(
      chats.map(async (chat) => {
        const json = await populateGroupMembers(chat);

        // Populate createdBy
        if (json.createdBy) {
          const creator = await queryOne(
            `SELECT "id","name" FROM "members" WHERE "id" = $1`,
            [json.createdBy]
          );
          json.createdBy = creator ? addId(creator) : json.createdBy;
        }

        // Last message
        const lastMessage = await queryOne(
          `SELECT cm.*,
            (SELECT json_build_object('id',m."id",'name',m."name")
             FROM "members" m WHERE m."id"=cm."senderId") AS "sender"
           FROM "chat_messages" cm
           WHERE cm."groupId" = $1
           ORDER BY cm."createdAt" DESC LIMIT 1`,
          [chat.id]
        );

        // Unread count
        const unreadResult = await queryOne(
          `SELECT COUNT(*) AS "count" FROM "chat_messages"
           WHERE "groupId" = $1 AND "senderId" != $2
             AND NOT ("readBy" @> ARRAY[$2]::bigint[])`,
          [chat.id, parseInt(userId)]
        );
        const unreadCount = parseInt(unreadResult?.count || 0);

        return {
          ...json,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sender: lastMessage.sender ? addId(lastMessage.sender) : null,
                createdAt: lastMessage.createdAt,
                messageType: lastMessage.messageType,
              }
            : null,
          unreadCount,
        };
      })
    );

    res.status(200).json({ data: chatsWithMeta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a group (paginated)
export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = getUserId(req.user);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Verify membership
    const group = await queryOne(
      `SELECT "id" FROM "chat_groups" WHERE "id" = $1 AND $2 = ANY("members")`,
      [groupId, userId]
    );
    if (!group) return res.status(403).json({ message: "You are not a member of this chat" });

    const totalResult = await queryOne(
      `SELECT COUNT(*) AS "count" FROM "chat_messages" WHERE "groupId" = $1`,
      [groupId]
    );
    const total = parseInt(totalResult?.count || 0);

    const messages = await query(
      `SELECT cm.*,
        (SELECT json_build_object(
          'id',m."id",'name',m."name",'memberId',m."memberId",
          'role',m."role",'designation',m."designation"
        ) FROM "members" m WHERE m."id"=cm."senderId") AS "sender"
       FROM "chat_messages" cm
       WHERE cm."groupId" = $1
       ORDER BY cm."createdAt" DESC
       OFFSET $2 LIMIT $3`,
      [groupId, (page - 1) * limit, limit]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE "chat_messages" SET "readBy" = array_append("readBy", $1)
       WHERE "groupId" = $2 AND NOT ("readBy" @> ARRAY[$1]::bigint[])`,
      [parseInt(userId), parseInt(groupId)]
    );

    res.status(200).json({
      data: addId(messages.reverse()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = getUserId(req.user);

    if (!content || !content.trim()) return res.status(400).json({ message: "Message content is required" });

    const group = await queryOne(
      `SELECT "id" FROM "chat_groups" WHERE "id" = $1 AND $2 = ANY("members")`,
      [groupId, userId]
    );
    if (!group) return res.status(403).json({ message: "You are not a member of this chat" });

    const message = await queryOne(
      `INSERT INTO "chat_messages" ("groupId","senderId","content","messageType","readBy")
       VALUES ($1,$2,$3,'text',$4::bigint[]) RETURNING *`,
      [groupId, userId, content.trim(), [userId]]
    );

    // Update group's updatedAt
    await pool.query(`UPDATE "chat_groups" SET "updatedAt" = NOW() WHERE "id" = $1`, [groupId]);

    // Populate sender
    const sender = await queryOne(
      `SELECT "id","name","memberId","role","designation" FROM "members" WHERE "id" = $1`,
      [userId]
    );
    const populated = addId({ ...message, sender: sender ? addId(sender) : null });

    res.status(201).json({ data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get member detail
export const getMemberDetail = async (req, res) => {
  try {
    const { memberId } = req.params;
    const orgId = req.user.organizationId;

    const member = await queryOne(
      `SELECT "id","name","memberId","role","designation","skills","createdAt"
       FROM "members" WHERE "id" = $1 AND "organizationId" = $2`,
      [memberId, orgId]
    );
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Get teams this member is part of
    const teams = await query(
      `SELECT t."id",t."teamName",t."description"
       FROM "teams" t
       JOIN "team_members" tm ON tm."teamId" = t."id"
       WHERE t."organizationId" = $1 AND tm."memberId" = $2`,
      [orgId, memberId]
    );

    const result = addId(member);
    result.teams = addId(teams);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
