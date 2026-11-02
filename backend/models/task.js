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
            tre
        },
        description : {
            type : String,
            required : true
        },
        memberId : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "Member",
                    required : true
                }
    },
    {
        timestamps : true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;