import bcrypt from "bcryptjs";
import Member from "../models/member.js";
import Organization from "../models/organization.js";
import Team from "../models/team.js";
import Project from "../models/project.js";

// Show profile of the user(Admin)
export const getProfile = async (req, res) =>{
    const { organizationId, userId, role} = req.user;
     if(role != "admin")
        {
            return res.status().json(
                {
                    message : "You are not authorized",
                }
            )
        }

    try{
        const id = userId || organizationId;
        const user = await Organization.findOne({ id }, { password : 0 });
        
        if(!user)
        {
            return res.status(404).json({
                message : "User not found"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                user
            })
        }
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Request failed"
        })
    }
}

// Update profile of the user(Admin)
export const updateProfile = async (req, res) =>{
    const { organizationId, userId, role} = req.user;
     if(role != "admin")
        {
            return res.status().json(
                {
                    message : "You are not authorized",
                }
            )
        }

    try{
        const id = userId || organizationId;
        const user = await Organization.findOne({ id }, { password : 0 });
        
        if(!user)
        {
            return res.status(404).json({
                message : "User not found"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                user
            })
        }
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Request failed"
        })
    }
}

// Create a new member in the organization
export const createMember = async (req, res) =>{
    const {name, role, memberId, password, designation, skills} = req.body;
    const {organizationId, role : adminRole} = req.user;
    if(adminRole != "admin")
        {
            return res.status().json(
                {
                    message : "You are not authorized",
                }
            )
        }

   try{
    const isExistUser = await Member.findOne({organizationId, memberId});

    if(isExistUser)
    {
        return res.status(409).json({
            message : "User already exist"
        })
    }
    else{
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Member.create(
            {
                name,
                organizationId,
                role,
                memberId,
                password : hashedPassword,
                designation,
                skills
            });
        res.status(200).json({
            success : true, 
            message : "Member's log created",
            user                                        //temperory
        })
    }

   }
   catch(error)
    {
        return res.status(500).json({
            success: false,
            message: "Failed to create member log"
        });
    }
    
}

// Extract all members of an organization
export const getMembers = async (req, res) => {
        const { organizationId, role } = req.user;
        if(role != "admin")
        {
            return res.status().json(
                {
                    message : "You are not authorized",
                }
            )
        }

    try {      

        let members = await Member.find({ organizationId }, {password : 0});

        return res.status(200).json({
            success: true,
            members
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch members"
        });
    }
};


// Update the existing member profile mejority role
export const updateMember = async (req, res) =>{
    const Id = req.params._id;
    const { name, role, designation, skills } = req.body;
    const { role : adminRole} = req.user;
    if(adminRole != "admin")
        {
            return res.status().json(
                {
                    message : "You are not authorized",
                }
            )
        }

    try{
        const user = await Member.findOne({ Id });
            if(!user)
                return res.status(404).json({
                    message : "User not found"
            })
            else{
                const updatedUser = await Member.findOneAndUpdate({ Id }, {name, role, designation, skills});
                return res.status(200).json({
                    success : true, 
                    message : "Update successful",
                    updatedUser
                })
            }
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to update"
        })
    }
}


// Delete existin member from organization
export const deleteMember = async (req, res) =>{
    try{
        const Id  = req.params._id;


        const user = await Member.findOne({ Id });
        if(!user)
        {
            return res.status(404).json({
                message : "User not found"
            })
        }
        else{
            const deletedMember = await Member.findOneAndDelete({ Id });
            return res.status(200).json({
                success : true,
                message : "Delete member successfully",
                deletedMember
            })
        }
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to delete member"
        })
    }
}



// Extract all teams of an organization
export const getAllTeams = async (req, res) => {
    const { organizationId, role } = req.user;

    try{
        if(role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to access this resource",
            });
        }
        if(!organizationId){
            return res.status(400)
            {
                message : "please provide organization Id"
            }
        }

        const teams = await Team.find({ organizationId });
        if(!teams || teams.length === 0){
            return res.status(404).json({
                message: "No teams found for this organization",
            });
        }
        else{
            return res.status(200).json({
                success: true,
                teams
            });
    }
}
catch(error){
    return res.status(500).json({
        success: false,
        message: "Failed to fetch teams"
    })
}
}

// Extract a team by its ID
export const getTeamById = async (req, res) => {
    const teamId = req.params._id;

    try{
        const team = await Team.findById(teamId);
        if(!team){
            return res.status(404).json({
                message: "Team not found",
            });
        }
        else{
            return res.status(200).json({
                success: true,
                team
            });
        }
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to fetch team"
        })
    }
}


// Extrac all Projects of an Organization
export const getAllProjects = async (req, res) => {
    try{
    const { organizationId, role } = req.user;
    if(role !== "admin") {
        return res.status(403).json({
            message: "You are not authorized to access this resource",
        });
    }
    const projects = await Project.find({ organizationId });
    if(!projects || projects.length === 0){
        return res.status(404).json({
            success : false,
            message : "Projects not foun yet"
        }
        )}
        else{
            success : true,
            projects
        }
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects"
        })
    }
}

// Extract of an project in detail
const getProjectById = async (req, res) =>{
    try{
        const projectId = req.params._id;
        const project = await Project.findById(projectId);
        if(!project){
            return res.status(404).json({
                message: "Project not found",
            });
        }
        else{
            return res.status(200).json({
                success: true,
                project
            });
        }
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to fetch project"
        })
    }
}