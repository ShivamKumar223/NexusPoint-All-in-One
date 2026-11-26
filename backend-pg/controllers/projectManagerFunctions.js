import { query, queryOne, setJunction } from "../utils/query.js";
import { addId } from "../utils/addId.js";

// ── SQL fragments ──────────────────────────────────────────
const ORG_SUB = `(SELECT json_build_object(
  'id',o."id",'organizationName',o."organizationName",
  'ownerName',o."ownerName",'email',o."email",'role',o."role"
) FROM "organizations" o WHERE o."id"=m."organizationId") AS "Organization"`;

const TEAM_MEMBERS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',m."id",'name',m."name",'memberId',m."memberId",
    'role',m."role",'designation',m."designation",'skills',m."skills"
  )) FROM "team_members" tm
  JOIN "members" m ON tm."memberId"=m."id"
  WHERE tm."teamId"=t."id"),'[]'::json) AS "members"`;

const PROJECT_TEAMS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',t2."id",'teamName',t2."teamName",'description',t2."description"
  )) FROM "project_teams" pt
  JOIN "teams" t2 ON pt."teamId"=t2."id"
  WHERE pt."projectId"=p."id"),'[]'::json) AS "teams"`;

const MODULE_TEAMS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',t."id",'teamName',t."teamName",'description',t."description"
  )) FROM "module_teams" mt
  JOIN "teams" t ON mt."teamId"=t."id"
  WHERE mt."moduleId"=mod."id"),'[]'::json) AS "teams"`;

// ═══════════════════════════════════════════════════════════
// Profile
// ═══════════════════════════════════════════════════════════
export const getProfile = async (req, res) => {
  const { organizationId, memberId, role: roleIs } = req.user;
  if (roleIs != "project-manager") {
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
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const result = addId(user);
    if (result.Organization) { result.organizationId = result.Organization; delete result.Organization; }
    return res.status(200).json({ success: true, message: "Success", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed due to server side error" });
  }
};

// Get all members in the organization
export const getAllOrgMembers = async (req, res) => {
  try {
    const { organizationId, role } = req.user;
    if (role !== "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    const members = await query(
      `SELECT "id","organizationId","name","memberId","role","designation","skills","createdAt","updatedAt"
       FROM "members" WHERE "organizationId" = $1`,
      [organizationId]
    );
    return res.status(200).json({ success: true, message: "Members fetched successfully", data: addId(members) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch members" });
  }
};

// Get ALL teams in organization
export const getAllOrgTeams = async (req, res) => {
  try {
    const { organizationId, role } = req.user;
    if (role !== "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    const teams = await query(
      `SELECT t.*, ${TEAM_MEMBERS_AGG}
       FROM "teams" t WHERE t."organizationId" = $1`,
      [organizationId]
    );
    return res.status(200).json({ success: true, message: "Teams fetched successfully", data: addId(teams) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch org teams" });
  }
};

// ═══════════════════════════════════════════════════════════
// Teams CRUD
// ═══════════════════════════════════════════════════════════
export const createTeam = async (req, res) => {
  try {
    const { teamName, description, members } = req.body;
    const { organizationId, role, userId } = req.user;
    if (!role || !organizationId || !userId) return res.status(400).json({ success: false, message: "please provide role, organization Id and user Id" });
    if (role !== "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const team = await queryOne(
      `INSERT INTO "teams" ("organizationId","projectManagerId","teamName","description")
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [organizationId, userId, teamName, description]
    );
    if (!team) return res.status(500).json({ success: false, message: "Failed to create team" });

    if (members && members.length > 0) {
      await setJunction("team_members", "teamId", team.id, "memberId", members);
    }

    const result = await queryOne(
      `SELECT t.*, ${TEAM_MEMBERS_AGG} FROM "teams" t WHERE t."id" = $1`,
      [team.id]
    );
    return res.status(201).json({ success: true, message: "Team created successfully", data: addId(result) });
  } catch (error) {
    console.log("Actual Server Error : ", error);
    return res.status(500).json({ success: false, message: "Failed to create team due to server side error.", error: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { role } = req.user;
    const { teamId } = req.params;
    const { teamName, description, members } = req.body;
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    if (!teamId) return res.status(400).json({ success: false, message: "please provide team Id" });

    const team = await queryOne(`SELECT "id" FROM "teams" WHERE "id" = $1`, [teamId]);
    if (!team) return res.status(404).json({ success: false, message: "Team doesn't exist" });

    await queryOne(
      `UPDATE "teams" SET "teamName"=$1,"description"=$2 WHERE "id"=$3 RETURNING "id"`,
      [teamName, description, teamId]
    );
    if (members) {
      await setJunction("team_members", "teamId", teamId, "memberId", members);
    }

    const updatedTeam = await queryOne(
      `SELECT t.*, ${TEAM_MEMBERS_AGG} FROM "teams" t WHERE t."id" = $1`,
      [teamId]
    );
    return res.status(200).json({ success: true, message: "Team updated successfully", data: addId(updatedTeam) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update team", error: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { role } = req.user;
    if (!teamId || !role) return res.status(400).json({ success: false, message: "please provide team Id and role" });
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const team = await queryOne(
      `SELECT t.*, ${TEAM_MEMBERS_AGG} FROM "teams" t WHERE t."id" = $1`,
      [teamId]
    );
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const result = addId(team);
    await queryOne(`DELETE FROM "team_members" WHERE "teamId" = $1`, [teamId]);
    await queryOne(`DELETE FROM "teams" WHERE "id" = $1`, [teamId]);

    return res.status(200).json({ success: true, message: "Team deleted successfully", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Team deletion failed", error: error.message });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const { organizationId, userId, role } = req.user;
    if (!organizationId || !userId || !role) return res.status(400).json({ success: true, message: "please provide organization Id, user Id and role" });
    if (role !== "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const teams = await query(
      `SELECT t.*, ${TEAM_MEMBERS_AGG}
       FROM "teams" t WHERE t."organizationId" = $1 AND t."projectManagerId" = $2`,
      [organizationId, userId]
    );
    return res.status(200).json({ success: true, message: "Teams fetched successfully", data: addId(teams) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch teams" });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { role } = req.user;
    if (!teamId || !role) return res.status(400).json({ success: false, message: "please provide team Id and role" });
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const team = await queryOne(
      `SELECT t.*, ${TEAM_MEMBERS_AGG} FROM "teams" t WHERE t."id" = $1`,
      [teamId]
    );
    if (!team) return res.status(404).json({ success: false, message: "Team not found." });
    return res.status(200).json({ success: true, message: "Team fetched successfully", data: addId(team) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch team" });
  }
};

// ═══════════════════════════════════════════════════════════
// Projects CRUD
// ═══════════════════════════════════════════════════════════
export const createProject = async (req, res) => {
  try {
    const { organizationId, role, userId } = req.user;
    if (!organizationId || !role || !userId) return res.status(400).json({ success: false, message: "please provide organization Id, role and user Id" });
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const { projectName, description, teams, completeBy, status } = req.body;
    const newProject = await queryOne(
      `INSERT INTO "projects" ("organizationId","projectManagerId","projectName","description","completeBy","status")
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [organizationId, userId, projectName, description, completeBy, status || "pending"]
    );
    if (!newProject) return res.status(400).json({ success: false, message: "Failed to create project" });

    if (teams && teams.length > 0) {
      await setJunction("project_teams", "projectId", newProject.id, "teamId", teams);
    }

    const result = await queryOne(
      `SELECT p.*, ${PROJECT_TEAMS_AGG} FROM "projects" p WHERE p."id" = $1`,
      [newProject.id]
    );
    return res.status(201).json({ success: true, message: "Project created successfully", data: addId(result) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create project", error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role } = req.user;
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const { projectName, description, teams, completeBy, status } = req.body;
    const project = await queryOne(`SELECT "id" FROM "projects" WHERE "id" = $1`, [projectId]);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    await queryOne(
      `UPDATE "projects" SET "projectName"=$1,"description"=$2,"completeBy"=$3,"status"=$4
       WHERE "id"=$5 RETURNING "id"`,
      [projectName, description, completeBy, status, projectId]
    );
    if (teams) {
      await setJunction("project_teams", "projectId", projectId, "teamId", teams);
    }

    const updatedProject = await queryOne(
      `SELECT p.*, ${PROJECT_TEAMS_AGG} FROM "projects" p WHERE p."id" = $1`,
      [projectId]
    );
    return res.status(200).json({ success: true, message: "Project updated successfully", data: addId(updatedProject) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update project", error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { role } = req.user;
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const project = await queryOne(`SELECT * FROM "projects" WHERE "id" = $1`, [projectId]);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const result = addId(project);
    await queryOne(`DELETE FROM "project_teams" WHERE "projectId" = $1`, [projectId]);
    await queryOne(`DELETE FROM "projects" WHERE "id" = $1`, [projectId]);

    return res.status(200).json({ success: true, message: "Project deleted successfully", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete project", error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { organizationId, userId, role } = req.user;
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    if (!organizationId || !userId) return res.status(400).json({ success: false, message: "please provide organization Id and user Id" });

    const projects = await query(
      `SELECT p.*, ${PROJECT_TEAMS_AGG}
       FROM "projects" p WHERE p."organizationId" = $1 AND p."projectManagerId" = $2`,
      [organizationId, userId]
    );
    return res.status(200).json({ success: true, message: "Projects fetched successfully", data: addId(projects) });
  } catch (error) {
    console.log("Actual server error : ", error);
    return res.status(500).json({ success: false, message: "Failed to fetch projects due to server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.user;
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    if (!projectId) return res.status(400).json({ message: "please provide project Id" });

    const project = await queryOne(
      `SELECT p.*, ${PROJECT_TEAMS_AGG}
       FROM "projects" p WHERE p."projectManagerId" = $1 AND p."id" = $2`,
      [userId, projectId]
    );
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    return res.status(200).json({ success: true, message: "Project fetched successfully", data: addId(project) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
};

// ═══════════════════════════════════════════════════════════
// Modules CRUD
// ═══════════════════════════════════════════════════════════
export const createModule = async (req, res) => {
  try {
    const { organizationId, role, userId } = req.user;
    const { projectId } = req.params;
    const { moduleName, description, teams, completeBy, status } = req.body;

    if (!organizationId || !role || !userId) return res.status(400).json({ success: false, message: "please provide organization Id, role and user Id" });
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    if (!projectId || !moduleName || !description) return res.status(400).json({ success: false, message: "please provide project Id, module name, and description" });

    const existingModule = await queryOne(
      `SELECT "id" FROM "modules" WHERE "projectId" = $1 AND "moduleName" = $2`,
      [projectId, moduleName]
    );
    if (existingModule) return res.status(400).json({ success: false, message: "A module with this name already exists in the project" });

    const newModule = await queryOne(
      `INSERT INTO "modules" ("projectId","moduleName","description","completeBy","status")
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [projectId, moduleName, description, completeBy, status || "pending"]
    );
    if (!newModule) return res.status(500).json({ success: false, message: "Failed to create module" });

    const teamIds = teams || [];
    if (teamIds.length > 0) {
      await setJunction("module_teams", "moduleId", newModule.id, "teamId", teamIds);
    }

    // Enroll members: get all member IDs from assigned teams
    if (teamIds.length > 0) {
      const teamMembers = await query(
        `SELECT DISTINCT "memberId" FROM "team_members" WHERE "teamId" = ANY($1::bigint[])`,
        [teamIds.map(Number)]
      );
      const uniqueMemberIds = teamMembers.map((tm) => tm.memberId);
      if (uniqueMemberIds.length > 0) {
        await setJunction("module_members", "moduleId", newModule.id, "memberId", uniqueMemberIds);
      }
    }

    return res.status(201).json({ success: true, message: "Module created successfully", data: addId(newModule) });
  } catch (error) {
    console.log("Actual server error : ", error);
    return res.status(500).json({ success: false, message: "Failed to create module due to server side error.", error: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const { role } = req.user;
    const { moduleName, description, teams, completeBy, status } = req.body;
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    if (!moduleId) return res.status(400).json({ success: false, message: "please provide module Id" });

    const mod = await queryOne(`SELECT "id" FROM "modules" WHERE "id" = $1`, [moduleId]);
    if (!mod) return res.status(404).json({ success: false, message: "Module not found" });

    await queryOne(
      `UPDATE "modules" SET "moduleName"=$1,"description"=$2,"completeBy"=$3,"status"=$4
       WHERE "id"=$5 RETURNING "id"`,
      [moduleName, description, completeBy, status, moduleId]
    );
    if (teams) {
      await setJunction("module_teams", "moduleId", moduleId, "teamId", teams);
    }

    const updatedModule = await queryOne(
      `SELECT mod.*, ${MODULE_TEAMS_AGG} FROM "modules" mod WHERE mod."id" = $1`,
      [moduleId]
    );
    return res.status(200).json({ success: true, message: "Module updated successfully", data: addId(updatedModule) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update the module", error: error.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const { role } = req.user;
    if (!moduleId) return res.status(400).json({ success: false, message: "Please provide moduleId" });
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });

    const mod = await queryOne(`SELECT * FROM "modules" WHERE "id" = $1`, [moduleId]);
    if (!mod) return res.status(404).json({ success: false, message: "Module not found." });

    const result = addId(mod);

    await queryOne(`DELETE FROM "module_teams" WHERE "moduleId" = $1`, [moduleId]);
    await queryOne(`DELETE FROM "module_members" WHERE "moduleId" = $1`, [moduleId]);
    await queryOne(`DELETE FROM "modules" WHERE "id" = $1`, [moduleId]);

    return res.status(200).json({ success: true, message: "Module deleted successfully", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete the module", error: error.message });
  }
};

export const getAllModulesByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role } = req.user;
    if (role != "project-manager") return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    if (!projectId) return res.status(400).json({ success: true, message: "please provide project Id" });

    const modules = await query(
      `SELECT mod.*, ${MODULE_TEAMS_AGG} FROM "modules" mod WHERE mod."projectId" = $1`,
      [projectId]
    );
    return res.status(200).json({ success: true, message: "Modules fetched successfully", data: addId(modules) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch modules" });
  }
};

// Update project status
export const updateProjectStatus = async (req, res) => {
  try {
    const { role } = req.user;
    const { projectId } = req.params;
    const { newStatus } = req.body;
    if (!role || !projectId || !newStatus) return res.status(400).json({ success: false, message: "Please provide role, projectId and new status" });
    if (role != "project-manager") return res.status(403).json({ success: false, message: "Access denied. Only project managers can update project status." });

    const project = await queryOne(`SELECT "id" FROM "projects" WHERE "id" = $1`, [projectId]);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const updated = await queryOne(
      `UPDATE "projects" SET "status" = $1 WHERE "id" = $2 RETURNING *`,
      [newStatus, projectId]
    );
    return res.status(200).json({ success: true, message: "Status updated successfully", data: addId(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
