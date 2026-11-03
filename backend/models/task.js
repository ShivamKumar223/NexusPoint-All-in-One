import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        moduleId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Module"
        },
        taskName : {
            type : String,
            required : true,
        },
        description : {
            type : String,
            required : true
        },
        members : [{
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "Member",
                    required : true
        }],
        startFrom : {
            type : Date,
            required : true,
            default :Date.now,
        },
        completeBy : {
            type : Date,
            required : true
        },
         status : {
            type : String,
            required : true,
            enum : [
                "pending",
                "inprogress",
                "review",
                "complete",
                "archive"
            ],
            default : "pending"
        }
    },

    {
        timestamps : true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;