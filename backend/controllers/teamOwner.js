// Team Owne Functions

import Module from "../models/module.js";
import ModuleEnrollment from "../models/moduleEnrollment.js";
import Task from "../models/task.js";
import TaskEnrollment from "../models/taskEnrollment.js";
import TeamEnrollment from "../models/teamEnrollment.js";

// Get profile of Project Manager
export const  getProfile = async (req, res) =>{
    try{
        const { id:userId } = req.user;

        const user = await Member.findOne({ userId });
        if(!user)
            {
                return res.status(404).json({
                    message : "User not exist"
                })
            }
            else{
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json({
                success : true,
                data : userWithoutPassword
            })
        }
    }
    catch(error)
    {
        return res.status(500).json({
            success : true,
            message : "Request failed"
        })
    }
}


// Extract all Modules associated with a team owner
export const getMyModules = async (req, res)=>{
    try{
        const { role, id:memberId } = req.user;
        if(!role || !memberId)
        {
            return res.status(400).json({
                success : false,
                message : "Please provide role and memberId"
            }) 
        }
        if(role !== "team-owner")
        {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only team owners can create tasks."
            })
        }
        const myModules = await ModuleEnrollment.find({memberId}).populate("Module");
        if(!myModules)
        {
            return res.status(204).json({
                success : false,
                message : "Module not found yet"
            })
        }

        return res.status(200).json({
            success : true,
            message : "Success",
            data : myModules
        })

    }
    catch(error)
    {
        return res.status(500).json({
            success : false,
            message : "Enternal server error",
            error : error.message
        })
    }
}

// Create a new task
export const createTask = async (req, res) => {
    try {
        const { role } = req.user;
        const { moduleId } = req.params;
        const { taskName, description, members, startFrom, completeBy } = req.body;
        if (role !== "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only team owners can create tasks."
            });
        }
        if (!moduleId || !taskName || !description || !members || !startFrom || !completeBy) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const newTask = await Task.create({
            moduleId,
            taskName,
            description,
            members,
            startFrom,
            completeBy
        });

        if (!newTask) {
            return res.status(400).json({
                success: false,
                message: "Task creation failed."
            });
        }
        const { members:taskMembers, id } = newTask;
        for(const member of taskMembers)
        {
            TaskEnrollment.findById(member, {$push : {tasks: id}})
        }
        return res.status(201).json({
            success: true,
            message: "Task created successfully.",
            data: newTask
        });
    }
    catch (error) {
        return res.status(500).json(
            success = false,
            message = "Internal Server Error",
            error = error.message
        )
    }
}

// Update a task
export const updateTask = async (req, res) => {
    try {
        const { role } = req.user;
        const { taskId } = req.params;
        const { taskName, description, members, startFrom, completeBy } = req.body;
        if (role !== "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only team owners can update tasks."
            });
        }
        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: "Task ID is required."
            });
        }
        const updatedTask = await Task.findByIdAndUpdate({ _id: taskId }, {
            taskName,
            description,
            members,
            startFrom,
            completeBy
        });

        if (!updatedTask) {
            return res.status(400).json({
                success: false,
                message: "Task update failed."
            });
        }
        return res.status(201).json({
            success: true,
            message: "Task updated successfully.",
            data: updatedTask
        });
    }
    catch (error) {
        return res.status(500).json(
            success = false,
            message = "Internal Server Error",
            error = error.message
        )
    }
}

// Delete a task
export const deleteTask = async (req, res) => {
    try {
        const { role } = req.user;
        const { taskId } = req.params;
        if (role !== "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only team owners can delete tasks."
            });
        }
        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: "Task ID is required."
            });
        }
        const deletedTask = await Task.findByIdAndDelete({ _id: taskId });

        if (!deletedTask) {
            return res.status(400).json({
                success: false,
                message: "Task deletion failed."
            });
        }
        const { members:taskMembers, id} = deletedTask;
        for(const member of taskMembers)
        {
            TaskEnrollment.findById(member, {$pull : {tasks: id}});
        }
        return res.status(204).json({
            success: true,
            message: "Task deleted successfully.",
            data: deletedTask
        });
    }
    catch (error) {
        return res.status(500).json(
            success = false,
            message = "Internal Server Error",
            error = error.message
        )
    }
}

// Get all tasks
export const getAllTasksByModoleId = async (req, res) => {
    try {
        const { role } = req.user;
        const { moduleId } = req.params;
        if (role !== "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only team owners can view tasks."
            });
        }
        if (!moduleId) {
            return res.status(400).json({
                success: false,
                message: "Module ID is required."
            });
        }
        const tasks = await Task.find({ moduleId });
        if (!tasks) {
            return res.status(404).json({
                success: false,
                message: "No tasks found for the given module."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Tasks retrieved successfully.",
            data: tasks
        });
    }
    catch (error) {
        return res.status(500).json(
            success = false,
            message = "Internal Server Error",
            error = error.message
        )
    }
}

// Extract the team associated with the team owner
export const getMyTeams = async (req, res) => {
    try {
        const { role, id: memberId } = req.user;

        if (role !== "developer" && role !== "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only Team Owners can view their teams."
            });
        }
        if (!memberId) {
            return res.status(400).json({
                success: false,
                message: "Member ID is required."
            });
        }
        const team = await TeamEnrollment.findOne({ memberId });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Team retrieved successfully.",
            data : team
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Update module status
export const updateModuleStatus = async (req, res) => {
    try {
        const { role, _id: memberId } = req.user;
        const { moduleId } = req.params;
        const { newStatus } = req.body;
        if (!role || !memberId || !moduleId || !newStatus) {
            return res.status(400).json({
                success: false,
                message: "Please provide role, memberId, ModuleId and new status"
            })
        }
        if (role != "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only developers can view their teams."
            });
        }
        const updatedModule = await Module.findOneAndUpdate({ _id: moduleId }, { status: newStatus });
        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            })
        }

        return res.status(201).json({
            success: true,
            message: "Status updated successfully",
            data : updatedModule
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
