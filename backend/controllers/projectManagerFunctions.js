import Module from "../models/module";
import Project from "../models/project";
import Team from "../models/team";


// Create new team in an organization
export const createTeam = async (req, res) => {
    
    try{
    const { organizationId, role, _id } = req.user;

    if(!role || !organizationId || !_id){
        return res.status(400).json({
            message : "please provide role, organization Id and user Id"
        })
    }
    if(role !== "project-manager") {
        return res.status(403).json({
            message: "You are not authorized to access this resource",
        });
    }

    const { teamName, description, members} = req.body;
    const team = await Team.create({
        organizationId,
        projectManagerId: _id,
        teamName,
        description,
        members
    });

    if(!team){
        return res.status(500).json({
            success : false,
            message : "Failed to create team"
        })
    }
    else{
        return res.status(200).json({
            success : true,
            team
        })
    }}
    catch(error){
    return res.status().json({
        success: false,
        message: "Failed to create team"
    })}
}


// Update the existing team of a organization
export const updateTeam = async (req, res)=>{
    try{
        const teamId = req.params._id;
        if(!teamId){
            return res.status(400).json({
                message : "please provide team Id"
            })
        }
        const team = await Team.findById({_id:teamId});
        if(!team){
            return res.json(404).json({
                success : false,
                message : "Team doesn't exist"
            })
        }
        const {teamName, description, members} = req.body;
        const updatedTeam = await Team.findByIdAndUpdate({_id:teamId}, {teamName, description, members})
        if(!updatedTeam)
        {
            return res.status().json({
                success : false,
                message : "Team doesn't updated yet"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                message : "Team updated successfully",
                updatedTeam
            })
        }
    }
    catch(error)
    {
        return res.status().json({
            success : true,
            message : "Failed to update team"
        })
    }
}


// Delete existion team
export const deleteTeam = async (req, res)=>{
    try{
        const teamId = req.params._id;
        const {role} = req.user;
        if(!teamId || !role){
            return res.status(400).json({
                message : "please provide team Id and role"
            })
        }

        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        const team = await Team.findById({_id: teamId});
        if(!team){
            return res.status(404).json({
                success : false,
                message : "Team not found"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                message : "Team deleted successfully"
            })
        }
    }
    catch(error)
    {
        res.status().json({
            success : false,
            message : "Team doesn't delete yet"
        })
    }
}

// Extract all existing teams of an organization
export const getAllTeams = async (req, res)=>{
    try{
        const { organizationId, _id, role } = req.user;

        if(!organizationId || !_id || !role){
            return res.status(400).json({
                message : "please provide organization Id, user Id and role"
            })
        }

        if(role !== "project-manager") {
            return res.status(403).json({
                message: "You are not authorized to access this resource",
            });
        }

        const teams = await Team.find({ organizationId, projectManagerId: _id });
        if(!teams || teams.length === 0){
            return res.status(404).json({
                success : false,
                message: "Teams not found",
            });
        }
        return res.status(200).json({
            success : true,
            message: "Teams fetched successfully",
            teams
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to fetch teams"
        })
    }
}

// Extract detail of a existing team
export const teamById = async (req, res) =>{
    try{
        const teamId = req.params._id;
        const { role } = req.user;

        if(!teamId || !role){
            return res.status(400).json({
                message : "please provide team Id and role"
            })
        }

        if(role !== "project-manager") {
            return res.status(403).json({
                message: "You are not authorized to access this resource",
            });
        }

        const team = await Team.findById({_id: teamId});
        if(!team){
            return res.status(404).json({
                success : false,
                message : "Team not found"
            })
        }
        return res.status(200).json({
            success : true,
            message : "Team fetched successfully",
            team
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to fetch team"
        })
    }
}


// Create new project in an organization
export const createProject = async (req, res) => {
    try{
        const { organizationId, role, _id } = req.user;

        if(!organizationId || !role || !_id){
            return res.status(400).json({
                message : "please provide organization Id, role and user Id"
            })
        }

        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }

        const { projectName, description, teams, startFrom, completeBy, status } = req.body;
        const project = await Project.create({
            organizationId,
            projectManagerId: _id,
            projectName,
            description,
            teams,
            startFrom,
            completeBy,
            status
        });
        if(!project)
        {
            return res.status(400).json({
                success : false,
                message : "Failed to create project"
            })
        }
        return res.status(200).json({
            success : true,
            message : "Project created successfully",
            project
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to create project"
        })
    }
}

// Update the existing project of a organization
export const updateProject = async (req, res)=>{
    try{
        const projectId = req.params._id;
        const { role } = req.user;
        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        const { projectName, description, teams, startFrom, completeBy, status } = req.body;
        const updatedProject = await Project.findByIdAndUpdate({_id:projectId}, 
            {
                projectName,
                description, 
                teams, 
                startFrom, 
                completeBy, 
                status
            })
        if(!updatedProject)
        {
            return res.status(400).json({
                success : false,
                message : "Failed to update project"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                message : "Project updated successfully",
                updatedProject
            })
        }
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to update project"
        })
    }
}

// Delete existion project
export const deleteProject = async (req, res)=>{
    try{
        const projectId = req.params._id;
        const { role } = req.user;
        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
            const deletedProject = await Project.findByIdAndDelete({_id: projectId});
            if(!deletedProject){
                return res.status(404).json({
                    success : false,
                    message : "Project not found"
                })
            }else{
            return res.status(200).json({
                success : true,
                message : "Project deleted successfully",
                deletedProject
            })
        }
        }
          
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to delete project"
        })
    }
}

// Extract all existing projects
export const getAllProjects = async (req, res)=>{
    try{
        const { organizationId, _id, role } = req.user;
        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        if(!organizationId)
        {
            return res.status(400).json({
                message : "please provide organization Id"
            })
        }
        if(!_id)
        {
            return res.status(400).json({
                message : "please provide user Id"
            })
        }

        const projects = await Project.find({ organizationId, projectManagerId: _id });
        if(!projects || projects.length === 0){
            return res.status(404).json({
                success : false,
                message: "Projects not found",
            });
        }
        return res.status(200).json({
            success : true,
            message: "Projects fetched successfully",
            projects
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to fetch projects"
        })
    }
}

// Extaract detail of a existing project
export const projectById = async (req, res) =>{
    try{
        const projectId = req.params._id;
        const { role } = req.user;
        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        if(!projectId){
            return res.status(400).json({
                message : "please provide project Id"
            })
        }
        const project = await Project.findById({_id: projectId});
        if(project == null || project.length === 0){
            return res.status(404).json({
                success : false,
                message : "Project not found"
            })
        }

        return res.status(200).json({
            success : true,
            message : "Project fetched successfully",
            project
        })


    }catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to fetch project"
        })
    }
}


// Create new module in a existing project
export const createModule = async (req, res) => {
    try{
        const { organizationId, role, _id } = req.user;
        const { projectId } = req.params.projectId;
        const { moduleName, description, teams, startFrom, completeBy, status } = req.body;

        if(!organizationId || !role || !_id){
            return res.status(400).json({
                message : "please provide organization Id, role and user Id"
            })
        }

        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        if(!projectId || !moduleName || !description || !teams || !startFrom || !completeBy || !status){   
            return res.status(400).json({
                message : "please provide complete details of the module : project Id, module name, description, teams, start from, complete by and status"
            })
        }

        const module = await Module.findById({_id: projectId, moduleName});
        if(module)
        {
            return res.status().json({
                success : true,
                message : "The Module already exist"
            })
        }
        
        const newModule = await Module.create({projectId, moduleName, description, teams, startFrom, completeBy, status});
        if(!newModule){
            return res.status.json({
                success : false,
                message : "Failed to create module"
            })
        }
        else{
            return res.status(200).json({
                success : true,
                message : "Module created successfully",
                newModule
            })
        }
        
    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to create module"
        })
    }
}


// Update the existing module
export const updateModule = async (req, res) =>{
    try{
        const moduleId = req.params.moduleId;
        const { role } = req.user;
        const { moduleName, description, teams, startFrom, completeBy, status } = req.body;
        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        if(!moduleId || !moduleName || !description || !teams || !startFrom || !completeBy || !status){
            return res.status(400).json({
                message : "please provide complete details of the module : module Id, module name, description, teams, start from, complete by and status"
            })
        }

        const updatedModule = await Module.findByIdAndUpdate({_id: moduleId}, {moduleName, description, teams, startFrom, completeBy, status});
        if(!updatedModule){
            return res.status(404).json({
                success : false,
                message : "Module not found"
            })
        }

        return res.status(200).json({
            success : true,
            message : "Module updated successfully",
            updatedModule  
        })

    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Failed to update the module"
        })
    }
}

// Delete existion module
export const deleteModule = async (req, res) =>{
    try{
        const moduleId = req.params.moduleId;
        const { _id } = req.user;
        if(!moduleId)
        {
            return res.status().json({
                success : false,
                message : "Please provide moduleId"
            })
        }
        if(! _id )
        {
            return res.status().json({
                success : false,
                message : "Please provide createrId"
            })
        }
        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        const deletedModule = await Module.findOneAndDelete({_id : moduleId, });
        if(!deletedModule){
            return res.status(404).json({
                success : false,
                message : "Module not found"
            })
        }
        return res.status(200).json({
            success : true,
            message : "Module deleted successfully",
            deletedModule
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to delete the module"
        })
    }
}

// Extract all existing modules of a project
export const getAllModulesByProjectId = async (req, res) =>{
    try{
        const { projectId } = req.params;
        const { role } = req.user;
        if(role != "project-manager")
        {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to access this resource",
            })
        }
        if(!projectId)
        {
            return res.status(400).json({
                message : "please provide project Id"
            })
        }
        const modules = await Module.find({ projectId });
        if(!modules || modules.length === 0){
            return res.status(404).json({
                success : false,
                message: "Modules not found",
            });
        }
        return res.status(200).json({
            success : true,
            message: "Modules fetched successfully",
            modules
        });
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to fetch modules"
        })
    }
}