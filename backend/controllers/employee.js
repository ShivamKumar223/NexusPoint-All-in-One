// Employee Functions

import Task from "../models/task";
import TaskEnrollment from "../models/taskEnrollment";
import TeamEnrollment from "../models/teamEnrollment";

// Retrieve all tasks assigned to the employee
export const getMyTasks = async (req, res) => {
  try {
    const { role, _id:memberId } = req.user;

    if (role !== "developer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only developers can view their tasks."
      });
    }

    if(!memberId)
    {
      return res.status().json({
        success : false,
        message : "Please provide memberId"
      })
    }

    const tasks = await TaskEnrollment.find({
      memberId
    })
    .populate("Task")
    .populate("Module")
    .sort({ createdAt: -1 });

    if(!tasks)
    {
      return res.status(404).json({
        success : false,
        message : "Task not found yet"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully.",
      totalTasks: tasks.length,
      tasks
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Update the task status
export const updateTaskStatus = async (req, res)=>{
  try{
     const { role, _id:memberId } = req.user;
     const { taskId } = req.params;
     const { newStatus } = req.body;
     if(!role || !memberId || !taskId || !newStatus)
     {
        return res.status().json({
          success : false,
          message : "Please provide role, memberId, taskId and new status"
        })
     }
     const updatedTask = await Task.findOneAndUpdate({_id:taskId},{status : {$eq: newStatus}});
     if(!updatedTask){
      return res.status(404).json({
        success : false,
        message : "Task not found"
      })
    }

     return res.status(201).json({
      success : true,
      message : "Status updated successfully"
     })
    }
  catch(error)
  {
    return res.status(500).json({
      success : false,
      message : "Internal server error",
      error : error.message
    })
  }
}

// Extract all Team associate with the employee
// This function considers that one employee can be part of only one team at a time.
export const getMyTeams = async (req, res)=>{
  try {
  const { role, _id: memberId } = req.user;

  if(role !== "developer" && role !== "team-owner") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only developers can view their teams."
    });
  } 
  if(!memberId) {
    return res.status(400).json({
      success: false,
      message: "Member ID is required."
    });
  }
  const team = await TeamEnrollment.findOne({ memberId });
  if(!team) {
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
  catch(error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}
