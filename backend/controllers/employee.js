// Employee Functions

import Member from "../models/member.js";
import Task from "../models/task.js";
import TaskEnrollment from "../models/taskEnrollment.js";
import TeamEnrollment from "../models/teamEnrollment.js";
import Module from "../models/module.js";
import mongoose from "mongoose";

// Get profile of employee (developer)
export const getProfile = async (req, res) => {
  const { organizationId, memberId, role: roleIs } = req.user;
  if (roleIs !== "developer") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
  }
  try {
    const user = await Member.findOne({ organizationId, memberId }, { password: 0 }).populate("organizationId");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "Success", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed due to server side error" });
  }
};

// Retrieve all tasks assigned to the employee
// TaskEnrollment schema: { memberId: ObjectId(Member), tasks: [ObjectId(Task)] }
export const getMyTasks = async (req, res) => {
  try {
    const { role, userId } = req.user;
    // console.log(req.user);
    if (role !== "developer") {
      return res.status(403).json({ success: false, message: "Access denied. Only employees can view their tasks." });
    }
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

     const memberId = new mongoose.Types.ObjectId(userId);
     console.log(userId);
    // Find the TaskEnrollment doc for this member and populate the tasks array
    const enrollment = await TaskEnrollment.findOne({ memberId })
      .populate({
        path: "tasks",
        populate: { path: "moduleId", model: "Module", select: "moduleName" }
      });

      console.log(" Enrollment : ",enrollment);
    if (!enrollment) {
      return res.status(200).json({ success: true, message: "No tasks found.", data: [] });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully.",
      data: enrollment
    });

  } catch (error) {
    console.log("Actual Server Error", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Update the task status (body: { taskId, newStatus })
export const updateTaskStatus = async (req, res) => {
  try {
    const { role, memberId } = req.user;
    const { taskId, newStatus } = req.body;
    if (!role || !memberId || !taskId || !newStatus) {
      return res.status(400).json({ success: false, message: "Please provide role, memberId, taskId and newStatus" });
    }
    if (role !== "developer") {
      return res.status(403).json({ success: false, message: "Access denied. Only developers can update task status." });
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId, { status: newStatus }, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    return res.status(200).json({ success: true, message: "Status updated successfully", data: updatedTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Extract all Teams associated with the employee
// TeamEnrollment schema: { memberId: ObjectId(Member), teams: [ObjectId(Team)] }
export const getMyTeams = async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== "developer" && role !== "team-owner") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

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
      return res.status(200).json({ success: true, message: "No team enrollment found.", data: [] });
    }

    return res.status(200).json({
      success: true,
      message: "Teams retrieved successfully.",
      data: enrollment.teams || []
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
