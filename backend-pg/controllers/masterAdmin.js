import bcrypt from "bcryptjs";
import { query, queryOne } from "../utils/query.js";
import { addId } from "../utils/addId.js";

// ── SQL fragments ──────────────────────────────────────────
const MEMBER_COLS = `"id","organizationId","name","memberId","role","designation","skills","createdAt","updatedAt"`;

const TEAM_MEMBERS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',m."id",'name',m."name",'memberId',m."memberId",
    'role',m."role",'designation',m."designation",'skills',m."skills"
  )) FROM "team_members" tm
  JOIN "members" m ON tm."memberId"=m."id"
  WHERE tm."teamId"=t."id"),'[]'::json) AS "members"`;

const PROJECT_TEAMS_AGG = `COALESCE(
  (SELECT json_agg(json_build_object(
    'id',t2."id",'teamName',t2."teamName",'description',t2."description",
    'organizationId',t2."organizationId",'projectManagerId',t2."projectManagerId",
    'createdAt',t2."createdAt",'updatedAt',t2."updatedAt"
  )) FROM "project_teams" pt
  JOIN "teams" t2 ON pt."teamId"=t2."id"
  WHERE pt."projectId"=p."id"),'[]'::json) AS "teams"`;

// Show profile of the user (Master Admin)
export const getProfile = async (req, res) => {
  const { organizationId, email, role } = req.user;
  if (role != "master-admin") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
  }
  try {
    const user = await queryOne(
      `SELECT "id","organizationName","ownerName","role","email","createdAt","updatedAt"
       FROM "organizations" WHERE "email" = $1`,
      [email]
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "Success", data: addId(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Request failed" });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  const { organizationId, role } = req.user;
  const { organizationName, ownerName } = req.body;
  if (role != "master-admin") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
  }
  try {
    const user = await queryOne(`SELECT "id" FROM "organizations" WHERE "id" = $1`, [organizationId]);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const updated = await queryOne(
      `UPDATE "organizations" SET "organizationName"=$1,"ownerName"=$2 WHERE "id"=$3 RETURNING *`,
      [organizationName, ownerName, organizationId]
    );
    return res.status(200).json({ success: true, data: addId(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Request failed" });
  }
};

// Create a new member
export const createMember = async (req, res) => {
  const { name, role, memberId, password, designation, skills } = req.body;
  const { organizationId, role: roleIs } = req.user;
  if (roleIs != "master-admin") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
  }
  try {
    const isExistUser = await queryOne(
      `SELECT "id" FROM "members" WHERE "organizationId"=$1 AND "memberId"=$2`,
      [organizationId, memberId]
    );
    if (isExistUser != null) {
      return res.status(409).json({ success: false, message: "User already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await queryOne(
      `INSERT INTO "members" ("name","organizationId","memberId","password","role","designation","skills")
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING "id"`,
      [name, organizationId, memberId, hashedPassword, role, designation, skills || []]
    );
    res.status(201).json({ success: true, message: "Member's log created" });
  } catch (error) {
    console.log("Real error : ", error);
    return res.status(500).json({ success: false, message: "Failed to create member's log" });
  }
};

// Extract all members
export const getMembers = async (req, res) => {
  const { organizationId, role: roleIs } = req.user;
  if (roleIs != "master-admin") {
    return res.status(403).json({ success: true, message: "You are not authorized to access this resource" });
  }
  try {
    const members = await query(
      `SELECT ${MEMBER_COLS} FROM "members" WHERE "organizationId" = $1`,
      [organizationId]
    );
    return res.status(200).json({ success: true, message: "Success", data: addId(members) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch members" });
  }
};

// Update the existing member
export const updateMember = async (req, res) => {
  const { memberId } = req.params;
  const { name, role, designation, skills } = req.body;
  const { role: roleIs } = req.user;
  if (roleIs != "master-admin") {
    return res.status(403).json({ success: true, message: "You are not authorized to access this resource" });
  }
  try {
    const user = await queryOne(`SELECT "id" FROM "members" WHERE "id" = $1`, [memberId]);
    if (!user) return res.status(404).json({ success: false, message: "User not found yet" });
    await queryOne(
      `UPDATE "members" SET "name"=$1,"role"=$2,"designation"=$3,"skills"=$4 WHERE "id"=$5 RETURNING "id"`,
      [name, role, designation, skills, memberId]
    );
    return res.status(200).json({ success: true, message: "Update successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update" });
  }
};

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role: roleIs } = req.user;
    if (roleIs != "master-admin") {
      return res.status(403).json({ success: true, message: "You are not authorized to access this resource" });
    }
    const deletedUser = await queryOne(`SELECT "id" FROM "members" WHERE "id" = $1`, [memberId]);
    if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });
    await queryOne(`DELETE FROM "members" WHERE "id" = $1`, [memberId]);
    return res.status(200).json({ success: true, message: "Delete member successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete member" });
  }
};

// Extract all teams
export const getAllTeams = async (req, res) => {
  const { organizationId, role: roleIs } = req.user;
  try {
    if (roleIs != "master-admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    }
    if (!organizationId) {
      return res.status(400).json({ success: false, message: "please provide organization Id" });
    }
    const teams = await query(
      `SELECT t.*, ${TEAM_MEMBERS_AGG}
       FROM "teams" t WHERE t."organizationId" = $1`,
      [organizationId]
    );
    return res.status(200).json({ success: true, data: addId(teams) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch teams" });
  }
};

// Extract a team by ID
export const getTeamById = async (req, res) => {
  const { teamId } = req.params;
  const { role: roleIs } = req.user;
  if (roleIs !== "master-admin") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
  }
  try {
    const team = await queryOne(
      `SELECT t.*, ${TEAM_MEMBERS_AGG}
       FROM "teams" t WHERE t."id" = $1`,
      [teamId]
    );
    if (!team) return res.status(404).json({ message: "Team not found" });
    return res.status(200).json({ success: true, data: addId(team) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch team" });
  }
};

// Extract all Projects
export const getAllProjects = async (req, res) => {
  try {
    const { organizationId, role } = req.user;
    if (role != "master-admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    }
    const projects = await query(
      `SELECT p.*, ${PROJECT_TEAMS_AGG}
       FROM "projects" p WHERE p."organizationId" = $1`,
      [organizationId]
    );
    return res.status(200).json({ success: true, data: addId(projects) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};

// Extract project by ID
export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.organizationId;
    const { role } = req.user;
    if (role !== "master-admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    }
    const project = await queryOne(
      `SELECT p.*, ${PROJECT_TEAMS_AGG}
       FROM "projects" p WHERE p."id" = $1`,
      [projectId]
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.status(200).json({ success: true, data: addId(project) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
};
