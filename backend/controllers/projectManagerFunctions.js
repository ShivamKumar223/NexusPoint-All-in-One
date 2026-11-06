import Member from "../models/member.js";
import Module from "../models/module.js";
import Project from "../models/project.js";
import Team from "../models/team.js";
import TeamEnrollment from "../models/teamEnrollment.js";

// Get profile of Project Manager
export const getProfile = async (req, res) => {
    const { organizationId, memberId, role: roleIs } = req.user;
    if (roleIs != "project-manager") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this resource",
        });
    }
    try {
        const user = await Member.findOne({ organizationId, memberId }, { password: 0 });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, message: "Success", data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Login failed due to server side error" });
    }
};

// Get all members in the organization (for PM to see)
export const getAllOrgMembers = async (req, res) => {
    try {
        const { organizationId, role } = req.user;
        if (role !== "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const members = await Member.find({ organizationId }, { password: 0 });
        return res.status(200).json({ success: true, message: "Members fetched successfully", data: members });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch members" });
    }
};

// Get ALL teams in organization (not just PM's) — needed for project team assignment
export const getAllOrgTeams = async (req, res) => {
    try {
        const { organizationId, role } = req.user;
        if (role !== "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const teams = await Team.find({ organizationId }).populate("members", "name designation role memberId");
        return res.status(200).json({ success: true, message: "Teams fetched successfully", data: teams });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch org teams" });
    }
};

// Create new team in an organization
export const createTeam = async (req, res) => {
    try {
        const { organizationId, role, id } = req.user;
        if (!role || !organizationId || !id) {
            return res.status(400).json({ success: false, message: "please provide role, organization Id and user Id" });
        }
        if (role !== "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const { teamName, description, members } = req.body;
        const team = await Team.create({ organizationId, projectManagerId: id, teamName, description, members });
        if (!team) {
            return res.status(500).json({ success: false, message: "Failed to create team" });
        }
        // add the teamId in every member which is member of this team
        const { members: teamMembers, _id: teamId } = team;
        for (const memberId of teamMembers) {
            await TeamEnrollment.findOneAndUpdate(
                { memberId },
                { $addToSet: { teams: teamId } },
                { upsert: true }
            );
        }
        return res.status(201).json({ success: true, message: "Team created successfully", data: team });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to create team", error: error.message });
    }
};

// Update the existing team of a organization
export const updateTeam = async (req, res) => {
    try {
        const { role } = req.user;
        const { teamName, description, members } = req.body;
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const { teamId } = req.params;
        if (!teamId) {
            return res.status(400).json({ success: false, message: "please provide team Id" });
        }
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team doesn't exist" });
        }
        const updatedTeam = await Team.findByIdAndUpdate(teamId, { teamName, description, members }, { new: true });
        if (!updatedTeam) {
            return res.status(400).json({ success: false, message: "Team doesn't updated yet" });
        }
        return res.status(200).json({ success: true, message: "Team updated successfully", data: updatedTeam });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update team", error: error.message });
    }
};

// Delete existing team
export const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { role } = req.user;
        if (!teamId || !role) {
            return res.status(400).json({ message: "please provide team Id and role" });
        }
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const deletedTeam = await Team.findByIdAndDelete(teamId);
        if (!deletedTeam) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }
        // Remove the teamId from all team members
        const { members, _id: deletedTeamId } = deletedTeam;
        for (const memberId of members) {
            await TeamEnrollment.findOneAndUpdate({ memberId }, { $pull: { teams: deletedTeamId } });
        }
        return res.status(200).json({ success: true, message: "Team deleted successfully", data: deletedTeam });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Team deletion failed", error: error.message });
    }
};

// Extract all existing teams of an organization (PM's own teams)
export const getAllTeams = async (req, res) => {
    try {
        const { organizationId, id, role } = req.user;
        if (!organizationId || !id || !role) {
            return res.status(400).json({ message: "please provide organization Id, user Id and role" });
        }
        if (role !== "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const teams = await Team.find({ organizationId, projectManagerId: id }).populate("members", "name designation role memberId");
        return res.status(200).json({ success: true, message: "Teams fetched successfully", data: teams });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch teams" });
    }
};

// Extract detail of an existing team
export const getTeamById = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { role } = req.user;
        if (!teamId || !role) {
            return res.status(400).json({ message: "please provide team Id and role" });
        }
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const team = await Team.findById(teamId).populate("members", "name designation role memberId skills");
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }
        return res.status(200).json({ success: true, message: "Team fetched successfully", data: team });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch team" });
    }
};

// Create new project in an organization
export const createProject = async (req, res) => {
    try {
        const { organizationId, role, id } = req.user;
        if (!organizationId || !role || !id) {
            return res.status(400).json({ message: "please provide organization Id, role and user Id" });
        }
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const { projectName, description, teams, completeBy, status } = req.body;
        const newProject = await Project.create({
            organizationId,
            projectManagerId: id,
            projectName,
            description,
            teams: teams || [],
            completeBy,
            status: status || "pending"
        });
        if (!newProject) {
            return res.status(400).json({ success: false, message: "Failed to create project" });
        }
        return res.status(201).json({ success: true, message: "Project created successfully", data: newProject });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to create project", error: error.message });
    }
};

// Update the existing project of a organization
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const { projectName, description, teams, completeBy, status } = req.body;
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { projectName, description, teams, completeBy, status },
            { new: true }
        );
        if (!updatedProject) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        return res.status(200).json({ success: true, message: "Project updated successfully", data: updatedProject });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update project", error: error.message });
    }
};

// Delete existing project
export const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        return res.status(200).json({ success: true, message: "Project deleted successfully", data: deletedProject });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete project", error: error.message });
    }
};

// Extract all existing projects
export const getAllProjects = async (req, res) => {
    try {
        const { organizationId, id, role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        if (!organizationId || !id) {
            return res.status(400).json({ message: "please provide organization Id and user Id" });
        }
        const projects = await Project.find({ organizationId, projectManagerId: id }).populate("teams", "teamName members");
        return res.status(200).json({ success: true, message: "Projects fetched successfully", data: projects });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch projects" });
    }
};

// Extract detail of an existing project
export const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        if (!projectId) {
            return res.status(400).json({ message: "please provide project Id" });
        }
        const project = await Project.findById(projectId).populate("teams", "teamName description members");
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        return res.status(200).json({ success: true, message: "Project fetched successfully", data: project });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch project" });
    }
};

// Create new module in a existing project
export const createModule = async (req, res) => {
    try {
        const { organizationId, role, id } = req.user;
        const { projectId } = req.params;
        const { moduleName, description, teams, completeBy, status } = req.body;

        if (!organizationId || !role || !id) {
            return res.status(400).json({ message: "please provide organization Id, role and user Id" });
        }
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        if (!projectId || !moduleName || !description) {
            return res.status(400).json({ message: "please provide project Id, module name, and description" });
        }

        // Check for duplicate module name in same project
        const existingModule = await Module.findOne({ projectId, moduleName });
        if (existingModule) {
            return res.status(400).json({ success: false, message: "A module with this name already exists in the project" });
        }

        const newModule = await Module.create({
            projectId,
            moduleName,
            description,
            teams: teams || [],
            completeBy,
            status: status || "pending"
        });
        if (!newModule) {
            return res.status(500).json({ success: false, message: "Failed to create module" });
        }
        return res.status(201).json({ success: true, message: "Module created successfully", data: newModule });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to create module", error: error.message });
    }
};

// Update the existing module
export const updateModule = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { role } = req.user;
        const { moduleName, description, teams, completeBy, status } = req.body;
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        if (!moduleId) {
            return res.status(400).json({ message: "please provide module Id" });
        }
        const updatedModule = await Module.findByIdAndUpdate(
            moduleId,
            { moduleName, description, teams, completeBy, status },
            { new: true }
        );
        if (!updatedModule) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }
        return res.status(200).json({ success: true, message: "Module updated successfully", data: updatedModule });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update the module", error: error.message });
    }
};

// Delete existing module
export const deleteModule = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { role } = req.user;
        if (!moduleId) {
            return res.status(400).json({ success: false, message: "Please provide moduleId" });
        }
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const deletedModule = await Module.findByIdAndDelete(moduleId);
        if (!deletedModule) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }
        return res.status(200).json({ success: true, message: "Module deleted successfully", data: deletedModule });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete the module", error: error.message });
    }
};

// Extract all existing modules of a project
export const getAllModulesByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        if (!projectId) {
            return res.status(400).json({ message: "please provide project Id" });
        }
        const modules = await Module.find({ projectId });
        return res.status(200).json({ success: true, message: "Modules fetched successfully", data: modules });
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
        if (!role || !projectId || !newStatus) {
            return res.status(400).json({ success: false, message: "Please provide role, projectId and new status" });
        }
        if (role != "project-manager") {
            return res.status(403).json({ success: false, message: "Access denied. Only project managers can update project status." });
        }
        const updatedProject = await Project.findByIdAndUpdate(projectId, { status: newStatus }, { new: true });
        if (!updatedProject) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        return res.status(200).json({ success: true, message: "Status updated successfully", data: updatedProject });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
