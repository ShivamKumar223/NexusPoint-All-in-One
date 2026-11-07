// Team Owner Functions

import Member from "../models/member.js";
import Module from "../models/module.js";
import ModuleEnrollment from "../models/moduleEnrollment.js";
import Task from "../models/task.js";
import TaskEnrollment from "../models/taskEnrollment.js";
import TeamEnrollment from "../models/teamEnrollment.js";
import Team from "../models/team.js";

// Get profile of team owner
export const getProfile = async (req, res) => {
    try {
        const { organizationId, memberId, role: roleIs } = req.user;
        console.log(roleIs);
        if (roleIs !== "team-owner") {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
        }
        const user = await Member.findOne({ organizationId, memberId }, { password: 0 }).populate("organizationId");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, message: "Success", data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Request failed" });
    }
};


// Extract all Modules associated with a team owner
// ModuleEnrollment schema: { memberId: ObjectId(Member), modules: [ObjectId(Module)] }
export const getMyModules = async (req, res) => {
    try {
        const { role, userId } = req.user;
        if (!role || !userId) {
            return res.status(400).json({ success: false, message: "Please provide role and userId" });
        }
        if (role !== "team-owner") {
            return res.status(403).json({ success: false, message: "Access denied. Only team owners can view modules." });
        }

        // const enrollment = await ModuleEnrollment.findOne({ memberId: userId })
        //     .populate({
        //         path: "modules",
        //         populate: [
        //             { path: "teams", model: "Team", select: "teamName members description" },
        //         ]
        //     });
        const enrollment = await ModuleEnrollment.findOne({ memberId: userId }).populate("modules");
        // console.log("enrollment : " ,enrollment);
        if (!enrollment) {
            return res.status(200).json({ success: true, message: "No module enrollment found.", data: [] });
        }

        return res.status(200).json({ success: true, message: "Success", data: enrollment.modules || [] });
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
        if (role !== "team-owner") {
            return res.status(403).json({ success: false, message: "Access denied. Only team owners can create tasks." });
        }
        if (!moduleId || !taskName || !description || !members || !completeBy) {
            return res.status(400).json({ success: false, message: "taskName, description, members and completeBy are required." });
        }
        const existingTask = await Task.findOne({ moduleId, taskName });
                if (existingTask) {
                    return res.status(400).json({
                        success: false,
                        message: "A Task with this name already exists in the project"
                    });
                }
                const newTask = await Task.create({ moduleId, taskName, description, members: members || [], completeBy });
                if (!newTask) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to create module"
                    });
                }
                
                const { members:memberIds, _id: taskId } = newTask;
        await Promise.all(
            memberIds.map(memberId =>
                TaskEnrollment.findOneAndUpdate(
                    { memberId },
                    { $addToSet: { tasks: taskId } },
                    { upsert: true, new: true }
                )
            )
        );

        return res.status(201).json({ 
            success: true, 
            message: "Task created successfully.", 
            data: newTask 
        });
    } catch (error) 
    {
        console.log("actual error :", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

// Update a task
export const updateTask = async (req, res) => {
    try {
        const { role } = req.user;
        const { taskId } = req.params;
        const { taskName, description, members, completeBy, status } = req.body;
        if (role !== "team-owner") {
            return res.status(403).json({ success: false, message: "Access denied. Only team owners can update tasks." });
        }
        if (!taskId) {
            return res.status(400).json({ success: false, message: "Task ID is required." });
        }
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { taskName, description, members, completeBy, status },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }
        return res.status(200).json({ success: true, message: "Task updated successfully.", data: updatedTask });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
    try {
        const { role } = req.user;
        const { taskId } = req.params;
        if (role !== "team-owner") {
            return res.status(403).json({ success: false, message: "Access denied. Only team owners can delete tasks." });
        }
        if (!taskId) {
            return res.status(400).json({ success: false, message: "Task ID is required." });
        }
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }
        return res.status(200).json({ success: true, message: "Task deleted successfully.", data: deletedTask });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Get all tasks for a module
export const getAllTasksByModoleId = async (req, res) => {
    try {
        const { role } = req.user;
        const { moduleId } = req.params;
        if (role !== "team-owner") {
            return res.status(403).json({ success: false, message: "Access denied. Only team owners can view tasks." });
        }
        if (!moduleId) {
            return res.status(400).json({ success: false, message: "Module ID is required." });
        }
        const tasks = await Task.find({ moduleId }).populate("members", "name memberId role designation skills");        return res.status(200).json({ success: true, message: "Tasks retrieved successfully.", data: tasks });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Extract the team(s) associated with the team owner
export const getMyTeams = async (req, res) => {
    try {
        const { role, userId } = req.user;

        if (role !== "developer" && role !== "team-owner") {
            return res.status(403).json({ success: false, message: "Access denied. Only Team Owners can view their teams." });
        }
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        // Find enrollment and populate teams with their members
        const enrollment = await TeamEnrollment.findOne({ memberId: userId })
            .populate({
                path: "teams",
                populate: {
                    path: "members",
                    select: "name memberId role designation skills",
                    model: "Member"
                }
            });

        if (!enrollment) {
            return res.status(404).json({ success: false, message: "No team enrollment found." });
        }

        // Return the teams array for easy consumption
        return res.status(200).json({
            success: true,
            message: "Team retrieved successfully.",
            data: enrollment.teams || []
        });
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
        if (role !== "team-owner") {
            return res.status(403).json({ success: false, message: "Access denied. Only team owners can update module status." });
        }
        const updatedModule = await Module.findByIdAndUpdate(moduleId, { status: newStatus }, { new: true });
        if (!updatedModule) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }
        return res.status(200).json({ success: true, message: "Status updated successfully", data: updatedModule });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
