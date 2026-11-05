import Member from "../models/member.js";
import Module from "../models/module.js";
import Project from "../models/project.js";
import Team from "../models/team.js";
import TeamEnrollment from "../models/teamEnrollment.js";

// Get profile of Project Manager
export const getProfile = async (req, res) => {
    const { organizationId, memberId, role: roleIs } = req.user;
    // console.log(req.user);
    if (roleIs != "project-manager") {
        return res.status(403).json(
            {
                success: true,
                message: "You are not authorized to access this resource",
            }
        )
    }

    try {
        const user = await Member.findOne({ organizationId, memberId }, { password: 0 });
        //console.log(user.id, typeof user.id); // This is completely correct: access as a string 
        //console.log(user._id, typeof user._id); // This is completely correct: access as a object 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        else {
            return res.status(200).json({
                success: true,
                message: "Success",
                data: user
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed due to server side error"
        })
    }
}

// Create new team in an organization
export const createTeam = async (req, res) => {

    try {
        const { organizationId, role, id } = req.user;

        if (!role || !organizationId || ! id) {
            return res.status(400).json({
                success: false,
                message: "please provide role, organization Id and user Id"
            })
        }
        if (role !== "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            });
        }

        const { teamName, description, members } = req.body;
        const team = await Team.create({
            organizationId,
            projectManagerId: id,
            teamName,
            description,
            members
        });

        if (!team) {
            return res.status(500).json({
                success: false,
                message: "Failed to create team"
            })
        }
        else {

            // add the teamId in every member which is member of this team
            const {members, id: teamId} = team;
            for(const member of members)
            {
                TeamEnrollment.findByIdAndUpdate(id, {$push: {teams: teamId}});
            }

            return res.status(201).json({
                success: true,
                message: "Team created successfully",
                data: team
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create team"
        })
    }
}


// Update the existing team of a organization
export const updateTeam = async (req, res) => {
    try {
        const { role } = req.user;
        const { teamName, description, members } = req.body;

        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            });
        }
        const { teamId } = req.params;
        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: "please provide team Id"
            })
        }

        const team = await Team.findById( teamId );
        if (!team) {
            return res.json(404).json({
                success: false,
                message: "Team doesn't exist"
            })
        }
        const updatedTeam = await Team.findByIdAndUpdate({ id: teamId }, { teamName, description, members })
        if (!updatedTeam) {
            return res.status().json({
                success: false,
                message: "Team doesn't updated yet"
            })
        }
        else {
            return res.status(201).json({
                success: true,
                message: "Team updated successfully",
                data: updatedTeam
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            success: true,
            message: "Failed to update team"
        })
    }
}


// Delete existion team
export const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { role } = req.user;
        if (!teamId || !role) {
            return res.status(400).json({
                message: "please provide team Id and role"
            })
        }

        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        const deletedTeam = await Team.findByIdAndDelete({ id: teamId });
        if (!deletedTeam) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            })
        }
        else {
            // Remove the teamId(team) from all team members
            const { members, id:teamId } = deletedTeam;
            for(const member of members)
            {
                TeamEnrollment.findByIdAndUpdate(id, {$pull: {teams: teamId}});
            }
            return res.status(204).json({
                success: true,
                message: "Team deleted successfully",
                data: deletedTeam
            })
        }
    }
    catch (error) {
        res.status().json({
            success: false,
            message: "Team doesn't delete yet"
        })
    }
}

// Extract all existing teams of an organization
export const getAllTeams = async (req, res) => {
    try {
        const { organizationId, id, role } = req.user;

        if (!organizationId || !id || !role) {
            return res.status(400).json({
                message: "please provide organization Id, user Id and role"
            })
        }

        if (role !== "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            });
        }

        const teams = await Team.find({ organizationId, projectManagerId: id });
        if (!teams || teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teams not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Teams fetched successfully",
            data: teams
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch teams"
        })
    }
}

// Extract detail of a existing team
export const getTeamById = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { role } = req.user;

        if (!teamId || !role) {
            return res.status(400).json({
                message: "please provide team Id and role"
            })
        }

        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }

        const team = await Team.findById({ id: teamId });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Team fetched successfully",
            data: team
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch team"
        })
    }
}


// Create new project in an organization
export const createProject = async (req, res) => {
    try {
        const { organizationId, role, id } = req.user;

        if (!organizationId || !role || ! id) {
            return res.status(400).json({
                message: "please provide organization Id, role and user Id"
            })
        }

        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }

        const { projectName, description, teams, startFrom, completeBy, status } = req.body;
        const newProject = await Project.create({
            organizationId,
            projectManagerId: id,
            projectName,
            description,
            teams,
            startFrom,
            completeBy,
            status
        });
        if (!newProject) {
            return res.status(400).json({
                success: false,
                message: "Failed to create project"
            })
        }
        
        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: newProject
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create project"
        })
    }
}

// Update the existing project of a organization
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        const { projectName, description, teams, startFrom, completeBy, status } = req.body;
        const updatedProject = await Project.findByIdAndUpdate({ id: projectId },
            {
                projectName,
                description,
                teams,
                startFrom,
                completeBy,
                status
            })
        if (!updatedProject) {
            return res.status(400).json({
                success: false,
                message: "Failed to update project"
            })
        }
        else {
            return res.status(201).json({
                success: true,
                message: "Project updated successfully",
                data: updatedProject
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update project"
        })
    }
}

// Delete existion project
export const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        const deletedProject = await Project.findByIdAndDelete( projectId );
        if (!deletedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            })
        } else {
            return res.status(204).json({
                success: true,
                message: "Project deleted successfully",
                data: deletedProject
            })
        }
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete project"
        })
    }
}

// Extract all existing projects
export const getAllProjects = async (req, res) => {
    try {
        const { organizationId, id, role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        if (!organizationId) {
            return res.status(400).json({
                message: "please provide organization Id"
            })
        }
        if (!id) {
            return res.status(400).json({
                message: "please provide user Id"
            })
        }

        const projects = await Project.find({ organizationId, projectManagerId: id });
        if (!projects || projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Projects not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: projects
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch projects"
        })
    }
}

// Extaract detail of a existing project
export const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        if (!projectId) {
            return res.status(400).json({
                message: "please provide project Id"
            })
        }
        const project = await Project.findById({ id: projectId });
        if (project == null || project.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            data: project
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch project"
        })
    }
}


// Create new module in a existing project
export const createModule = async (req, res) => {
    try {
        const { organizationId, role, id } = req.user;
        const { projectId } = req.params;
        const { moduleName, description, teams, startFrom, completeBy, status } = req.body;

        if (!organizationId || !role || !id) {
            return res.status(400).json({
                message: "please provide organization Id, role and user Id"
            })
        }

        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        if (!projectId || !moduleName || !description || !teams || !startFrom || !completeBy || !status) {
            return res.status(400).json({
                message: "please provide complete details of the module : project Id, module name, description, teams, start from, complete by and status"
            })
        }

        const module = await Module.findById({ id: projectId, moduleName });
        if (module) {
            return res.status(400).json({
                success: true,
                message: "The Module already exist"
            })
        }

        const newModule = await Module.create({ projectId, moduleName, description, teams, startFrom, completeBy, status });
        if (!newModule) {
            return res.status.json({
                success: false,
                message: "Failed to create module"
            })
        }
        else {
            return res.status(201).json({
                success: true,
                message: "Module created successfully",
                data: newModule
            })
        }

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create module"
        })
    }
}


// Update the existing module
export const updateModule = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { role } = req.user;
        const { moduleName, description, teams, startFrom, completeBy, status } = req.body;
        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        if (!moduleId || !moduleName || !description || !teams || !startFrom || !completeBy || !status) {
            return res.status(400).json({
                message: "please provide complete details of the module : module Id, module name, description, teams, start from, complete by and status"
            })
        }

        const updatedModule = await Module.findByIdAndUpdate({ id: moduleId }, { moduleName, description, teams, startFrom, completeBy, status });
        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            })
        }

        return res.status(201).json({
            success: true,
            message: "Module updated successfully",
            data: updatedModule
        })

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update the module"
        })
    }
}

// Delete existion module
export const deleteModule = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { id: memberId, role } = req.user;
        if (!moduleId) {
            return res.status(400).json({
                success: false,
                message: "Please provide moduleId"
            })
        }
        if (!memberId) {
            return res.status(400).json({
                success: false,
                message: "Please provide createrId"
            })
        }
        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        const deletedModule = await Module.findOneAndDelete({ id: moduleId, });
        if (!deletedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            })
        }
        return res.status(204).json({
            success: true,
            message: "Module deleted successfully",
            data: deletedModule
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete the module"
        })
    }
}

// Extract all existing modules of a project
export const getAllModulesByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { role } = req.user;
        if (role != "project-manager") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            })
        }
        if (!projectId) {
            return res.status(400).json({
                message: "please provide project Id"
            })
        }
        const modules = await Module.find({ projectId });
        if (!modules || modules.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Modules not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Modules fetched successfully",
            data: modules
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch modules"
        })
    }
}

// Upadate project status
export const updateProjectStatus = async (req, res) => {
    try {
        const { role, id: memberId } = req.user;
        const { ProjectId } = req.params;
        const { newStatus } = req.body;
        if (!role || !memberId || !ProjectId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: "Please provide role, memberId, ProjectId and new status"
            })
        }
        if (role != "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only developers can view their teams."
            });
        }
        const updatedProject = await Project.findOneAndUpdate({ id: ProjectId }, { status: newStatus });
        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            })
        }

        return res.status(201).json({
            success: true,
            message: "Status updated successfully",
            data : updatedProject
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}
