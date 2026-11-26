// Team Owner Functions
import { query, queryOne, setJunction } from "../utils/query.js";
import { addId } from "../utils/addId.js";

// ── SQL fragments ──────────────────────────────────────────
const ORG_SUB = `(SELECT json_build_object(
  'id',o."id",'organizationName',o."organizationName",
  'ownerName',o."ownerName",'email',o."email",'role',o."role"
) FROM "organizations" o WHERE o."id"=m."organizationId") AS "Organization"`;

const TEAM_MEMBERS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',mb."id",'name',mb."name",'memberId',mb."memberId",
    'role',mb."role",'designation',mb."designation",'skills',mb."skills"
  )) FROM "team_members" tm2
  JOIN "members" mb ON tm2."memberId"=mb."id"
  WHERE tm2."teamId"=t."id"),'[]'::json) AS "members"`;

const TASK_MEMBERS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',mb."id",'name',mb."name",'memberId',mb."memberId",
    'role',mb."role",'designation',mb."designation",'skills',mb."skills"
  )) FROM "task_members" tkm
  JOIN "members" mb ON tkm."memberId"=mb."id"
  WHERE tkm."taskId"=tk."id"),'[]'::json) AS "members"`;

// Get profile
export const getProfile = async (req, res) => {
  try {
    const { organizationId, memberId, role: roleIs } = req.user;
    if (roleIs !== "team-owner") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

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
    return res.status(500).json({ success: false, message: "Request failed" });
  }
};

// Get modules assigned to this team owner (via module_members enrollment)
export const getMyModules = async (req, res) => {
  try {
    const { role, userId } = req.user;
    if (!role || !userId) return res.status(400).json({ success: false, message: "Please provide role and userId" });
    if (role !== "team-owner") return res.status(403).json({ success: false, message: "Access denied. Only team owners can view modules." });

    const moduleIds = (
      await query(`SELECT "moduleId" FROM "module_members" WHERE "memberId" = $1`, [userId])
    ).map((e) => e.moduleId);

    if (moduleIds.length === 0) {
      return res.status(200).json({ success: true, message: "No module enrollment found.", data: [] });
    }

    const modules = await query(
      `SELECT * FROM "modules" WHERE "id" = ANY($1::bigint[])`,
      [moduleIds]
    );
    return res.status(200).json({ success: true, message: "Success", data: addId(modules) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { role } = req.user;
    const { moduleId } = req.params;
    const { taskName, description, members, completeBy } = req.body;
    if (role !== "team-owner") return res.status(403).json({ success: false, message: "Access denied. Only team owners can create tasks." });
    if (!moduleId || !taskName || !description || !members || !completeBy) {
      return res.status(400).json({ success: false, message: "taskName, description, members and completeBy are required." });
    }

    const existingTask = await queryOne(
      `SELECT "id" FROM "tasks" WHERE "moduleId" = $1 AND "taskName" = $2`,
      [moduleId, taskName]
    );
    if (existingTask) return res.status(400).json({ success: false, message: "A Task with this name already exists in the project" });

    const newTask = await queryOne(
      `INSERT INTO "tasks" ("moduleId","taskName","description","completeBy")
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [moduleId, taskName, description, completeBy]
    );
    if (!newTask) return res.status(500).json({ success: false, message: "Failed to create module" });

    const memberIds = members || [];
    if (memberIds.length > 0) {
      await setJunction("task_members", "taskId", newTask.id, "memberId", memberIds);
    }

    const result = await queryOne(
      `SELECT tk.*, ${TASK_MEMBERS_AGG} FROM "tasks" tk WHERE tk."id" = $1`,
      [newTask.id]
    );
    return res.status(201).json({ success: true, message: "Task created successfully.", data: addId(result) });
  } catch (error) {
    console.log("actual error :", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { role } = req.user;
    const { taskId } = req.params;
    const { taskName, description, members, completeBy, status } = req.body;
    if (role !== "team-owner") return res.status(403).json({ success: false, message: "Access denied. Only team owners can update tasks." });
    if (!taskId) return res.status(400).json({ success: false, message: "Task ID is required." });

    const task = await queryOne(`SELECT "id" FROM "tasks" WHERE "id" = $1`, [taskId]);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    await queryOne(
      `UPDATE "tasks" SET "taskName"=$1,"description"=$2,"completeBy"=$3,"status"=$4
       WHERE "id"=$5 RETURNING "id"`,
      [taskName, description, completeBy, status, taskId]
    );
    if (members) {
      await setJunction("task_members", "taskId", taskId, "memberId", members);
    }

    const updatedTask = await queryOne(
      `SELECT tk.*, ${TASK_MEMBERS_AGG} FROM "tasks" tk WHERE tk."id" = $1`,
      [taskId]
    );
    return res.status(200).json({ success: true, message: "Task updated successfully.", data: addId(updatedTask) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { role } = req.user;
    const { taskId } = req.params;
    if (role !== "team-owner") return res.status(403).json({ success: false, message: "Access denied. Only team owners can delete tasks." });
    if (!taskId) return res.status(400).json({ success: false, message: "Task ID is required." });

    const task = await queryOne(`SELECT * FROM "tasks" WHERE "id" = $1`, [taskId]);
    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    const result = addId(task);
    await queryOne(`DELETE FROM "task_members" WHERE "taskId" = $1`, [taskId]);
    await queryOne(`DELETE FROM "tasks" WHERE "id" = $1`, [taskId]);

    return res.status(200).json({ success: true, message: "Task deleted successfully.", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get all tasks for a module
export const getAllTasksByModoleId = async (req, res) => {
  try {
    const { role } = req.user;
    const { moduleId } = req.params;
    if (role !== "team-owner") return res.status(403).json({ success: false, message: "Access denied. Only team owners can view tasks." });
    if (!moduleId) return res.status(400).json({ success: false, message: "Module ID is required." });

    const tasks = await query(
      `SELECT tk.*, ${TASK_MEMBERS_AGG} FROM "tasks" tk WHERE tk."moduleId" = $1`,
      [moduleId]
    );
    return res.status(200).json({ success: true, message: "Tasks retrieved successfully.", data: addId(tasks) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Get teams associated with the team owner
export const getMyTeams = async (req, res) => {
  try {
    const { role, userId } = req.user;
    if (role !== "developer" && role !== "team-owner") {
      return res.status(403).json({ success: false, message: "Access denied. Only Team Owners can view their teams." });
    }
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required." });

    const teamIds = (
      await query(`SELECT "teamId" FROM "team_members" WHERE "memberId" = $1`, [userId])
    ).map((e) => e.teamId);

    if (teamIds.length === 0) {
      return res.status(404).json({ success: false, message: "No team enrollment found." });
    }

    const teams = await query(
      `SELECT t.*, ${TEAM_MEMBERS_AGG}
       FROM "teams" t WHERE t."id" = ANY($1::bigint[])`,
      [teamIds]
    );
    return res.status(200).json({ success: true, message: "Team retrieved successfully.", data: addId(teams) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Update module status
export const updateModuleStatus = async (req, res) => {
  try {
    const { role, userId: memberId } = req.user;
    const { moduleId } = req.params;
    const { newStatus } = req.body;
    if (!role || !memberId || !moduleId || !newStatus) {
      return res.status(400).json({ success: false, message: "Please provide role, memberId, ModuleId and new status" });
    }
    if (role !== "team-owner") return res.status(403).json({ success: false, message: "Access denied. Only team owners can update module status." });

    const mod = await queryOne(`SELECT "id" FROM "modules" WHERE "id" = $1`, [moduleId]);
    if (!mod) return res.status(404).json({ success: false, message: "Module not found" });

    const updated = await queryOne(
      `UPDATE "modules" SET "status" = $1 WHERE "id" = $2 RETURNING *`,
      [newStatus, moduleId]
    );
    return res.status(200).json({ success: true, message: "Status updated successfully", data: addId(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
