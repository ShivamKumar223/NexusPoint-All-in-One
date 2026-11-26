// Employee Functions
import { query, queryOne } from "../utils/query.js";
import { addId } from "../utils/addId.js";

// ── SQL fragments ──────────────────────────────────────────
const ORG_SUB = `(SELECT json_build_object(
  'id',o."id",'organizationName',o."organizationName",
  'ownerName',o."ownerName",'email',o."email",'role',o."role"
) FROM "organizations" o WHERE o."id" = m."organizationId") AS "Organization"`;

const TEAM_MEMBERS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',mb."id",'name',mb."name",'memberId',mb."memberId",
    'role',mb."role",'designation',mb."designation",'skills',mb."skills"
  )) FROM "team_members" tm2
  JOIN "members" mb ON tm2."memberId"=mb."id"
  WHERE tm2."teamId"=t."id"),'[]'::json) AS "members"`;

// Get profile of employee (developer)
export const getProfile = async (req, res) => {
  const { organizationId, memberId, role: roleIs } = req.user;
  if (roleIs !== "developer") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
  }
  try {
    const user = await queryOne(
      `SELECT m."id",m."organizationId",m."name",m."memberId",m."role",
              m."designation",m."skills",m."createdAt",m."updatedAt",
              ${ORG_SUB}
       FROM "members" m
       WHERE m."organizationId" = $1 AND m."memberId" = $2`,
      [organizationId, memberId]
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const result = addId(user);
    if (result.Organization) { result.organizationId = result.Organization; delete result.Organization; }
    return res.status(200).json({ success: true, message: "Success", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed due to server side error" });
  }
};

// Retrieve all tasks assigned to the employee
export const getMyTasks = async (req, res) => {
  try {
    const { role, userId } = req.user;
    if (role !== "developer") return res.status(403).json({ success: false, message: "Access denied. Only employees can view their tasks." });
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    const tasks = await query(
      `SELECT tk.*,
        (SELECT json_build_object('id',mod."id",'moduleName',mod."moduleName")
         FROM "modules" mod WHERE mod."id"=tk."moduleId") AS "Module"
       FROM "tasks" tk
       WHERE tk."id" IN (SELECT "taskId" FROM "task_members" WHERE "memberId" = $1)`,
      [userId]
    );

    // Transform: rename Module → moduleId for MongoDB compatibility
    const transformed = addId(tasks).map((t) => {
      if (t.Module) { t.moduleId = t.Module; delete t.Module; }
      return t;
    });

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully.",
      data: { memberId: userId, tasks: transformed },
    });
  } catch (error) {
    console.log("Actual Server Error", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { role, memberId } = req.user;
    const { taskId, newStatus } = req.body;
    if (!role || !memberId || !taskId || !newStatus) {
      return res.status(400).json({ success: false, message: "Please provide role, memberId, taskId and newStatus" });
    }
    if (role !== "developer") return res.status(403).json({ success: false, message: "Access denied. Only developers can update task status." });

    const task = await queryOne(`SELECT * FROM "tasks" WHERE "id" = $1`, [taskId]);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const updated = await queryOne(
      `UPDATE "tasks" SET "status" = $1 WHERE "id" = $2 RETURNING *`,
      [newStatus, taskId]
    );
    return res.status(200).json({ success: true, message: "Status updated successfully", data: addId(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get teams associated with the employee
export const getMyTeams = async (req, res) => {
  try {
    const { role, userId } = req.user;
    if (role !== "developer" && role !== "team-owner") return res.status(403).json({ success: false, message: "Access denied." });
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required." });

    const teamIds = (
      await query(`SELECT "teamId" FROM "team_members" WHERE "memberId" = $1`, [userId])
    ).map((r) => r.teamId);

    if (teamIds.length === 0) {
      return res.status(200).json({ success: true, message: "No team enrollment found.", data: [] });
    }

    const teams = await query(
      `SELECT t.*, ${TEAM_MEMBERS_AGG}
       FROM "teams" t WHERE t."id" = ANY($1::bigint[])`,
      [teamIds]
    );

    return res.status(200).json({ success: true, message: "Teams retrieved successfully.", data: addId(teams) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
