// Team Owne Functions

import Module from "../models/module";
import ModuleEnrollment from "../models/moduleEnrollment";

// Extract all Modules associated with a team owner
export const getAllModule = async (req, res)=>{
    try{
        const { role, _id:memberId } = req.user;
        if(!role || !memberId)
        {
            return res.status().json({
                success : false,
                message : "Please provide role and memberId";
            }) 
        }
        if(role !== "team-owner")
        {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only team owners can create tasks."
            })
        }
        const modules = await ModuleEnrollment.find({memberId});
        if(!modules)
        {
            return res.status().json({
                success : false,
                message : "Module not found yet"
            })
        }

        return res.status(201).json({
            success : true,
            message : "Success"
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
        const { moduleId, taskName, description, members, startFrom, completeBy } = req.body;
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
        return res.status(200).json({
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
        return res.status(200).json({
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
export const getAllTasks = async (req, res) => {
    try {
        const { role } = req.user;
        const { moduleId } = req.query;
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
        const { role, _id: memberId } = req.user;

        if (role !== "developer" && role !== "team-owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only developers can view their teams."
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
            team
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
            return res.status().json({
                success: false,
                message: "Please provide role, memberId, ModuleId and new status"
            })
        }
        if (role != "team-woner") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only developers can view their teams."
            });
        }
        const updatedModule = await Module.findOneAndUpdate({ _id: moduleId }, { status: { $eq: newStatus } });
        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            })
        }

        return res.status(201).json({
            success: true,
            message: "Status updated successfully"
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
