
// There are just following different functions of Master Admin

import bcrypt from "bcryptjs";
import Member from "../models/member.js";
import Organization from "../models/organization.js";
import Project from "../models/project.js";
import Team from "../models/team.js";

// Show profile of the user(Admin)
export const getProfile = async (req, res) => {
    const { organizationId, email, role } = req.user;
    // console.log(req.user);
    if (role != "master-admin") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this resource",
        })
    }

    try {

        // console.log(memberId);
        const user = await Organization.findOne({ email }, { password: 0 });

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
            message: "Request failed"
        })
    }
}


// Update profile of the user(Admin)
export const updateProfile = async (req, res) => {
    const { organizationId: memberId, role } = req.user;
    const { organizationName, ownerName } = req.body;
    if (role != "master-admin") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this resource",
        })
    }

    try {

        const user = await Organization.findOneAndUpdate({ organizationId: memberId }, { organizationName, ownerName });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        else {
            return res.status(200).json({
                success: true,
                data: user
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Request failed"
        })
    }
}


// Create a new member for the company
export const createMember = async (req, res) => {
    const { name, role, memberId, password, designation, skills } = req.body;
    const { organizationId, role: roleIs } = req.user;
    if (roleIs != "master-admin") {
        return res.status(403).json(
            {
                success: false,
                message: "You are not authorized to access this resource",
            }
        )
    }

    try {
        const isExistUser = await Member.findOne({ organizationId, memberId });
        if (isExistUser != null) {
            return res.status(409).json({
                success: false,
                message: "User already exist"
            })
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await Member.create(
                {
                    name,
                    organizationId,
                    memberId,
                    password: hashedPassword,
                    role,
                    designation,
                    skills
                });

            const {password:remove, ...data} = user;
            // console.log(data);
            res.status(201).json({
                success: true,
                message: "Member's log created",
                // data                                      
            })
        }

    }
    catch (error) {
        console.log("Real error",error);
        return res.status(500).json({
            success: false,
            message: "Failed to create member's log"
        });
    }

}


// Extract all members of an organization || tasted
export const getMembers = async (req, res) => {
    const { organizationId: memberId, organizationId, role: roleIs } = req.user;
    if (roleIs != "master-admin") {
        return res.status(403).json(
            {
                success: true,
                message: "You are not authorized to access this resource",
            }
        )
    }

    try {

        const members = await Member.find({ organizationId }, { password: 0 });

        return res.status(200).json({
            success: true,
            message: "Success",
            data: members
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch members"
        });
    }
};


// Update the existing member profile mejority role   || tasted
export const updateMember = async (req, res) => {
    const { memberId } = req.params;
    const { name, role, designation, skills } = req.body;
    const { organizationId, role: roleIs } = req.user;
    if (roleIs != "master-admin") {
        return res.status(403).json(
            {
                success: true,
                message: "You are not authorized to access this resource",
            }
        )
    }

    try {
        const updatedUser = await Member.findOneAndUpdate({ _id: memberId }, { name, role, designation, skills });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found yet"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Update successful",
            updatedUser
        })

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update"
        })
    }
}


// Delete existin member from organization   || tasted
export const deleteMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { role:roleIs } = req.user;
        if (roleIs != "master-admin") {
            return res.status(403).json(
                {
                    success: true,
                    message: "You are not authorized to access this resource",
                }
            )
        }
        const member = await Member.findOne({_id: memberId});
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const deletedUser = await Member.findOneAndDelete({_id:memberId });
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }
        else {
            return res.status(200).json({
                success: true,
                message: "Delete member successfully",
                // data: deletedUser

            })
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete member"
        })
    }
}



// Extract all teams of an organization
export const getAllTeams = async (req, res) => {
    const { organizationId, role: roleIs } = req.user;

    try {
        if (roleIs !== "master-admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            });
        }
        if (!organizationId) {
            return res.status(400).json(
                {
                    success: false,
                    message: "please provide organization Id"
                })
        }

        const teams = await Team.find({ organizationId });
        if (!teams || teams.length === 0) {
            return res.status(404).json({
                message: "No teams found for this organization",
            });
        }
        else {
            return res.status(200).json({
                success: true,
                teams
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch teams"
        })
    }
}

// Extract a team by its ID
export const getTeamById = async (req, res) => {
    const teamId = req.params.organizationId;
    const { role: roleIs, organizationId } = req.user;
    if (roleIs !== "master-admin") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this resource",
        });
    }

    try {
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }
        else {
            return res.status(200).json({
                success: true,
                team
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch team"
        })
    }
}


// Extrac all Projects of an Organization
export const getAllProjects = async (req, res) => {
    try {
        const { organizationId, role } = req.user;
        if (role != "master-admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            });
        }
        const projects = await Project.find({ organizationId });
        if (!projects) {
            return res.status(404).json({
                success: false,
                message: "Projects not foud yet"
            }
        )
    }
    else {
            console.log("Admin projects : ", projects);
            return res.status(200).json({
                success: true,
                data: projects
            })
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects"
        })
    }
}

// Extract of an project in detail
export const getProjectById = async (req, res) => {
    try {
        const projectId = req.params.organizationId;
        const { organizationId, role } = req.user;
        if (role !== "master-admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource",
            });
        }
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }
        else {
            return res.status(200).json({
                success: true,
                project
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch project"
        })
    }
}