import mongoose from "mongoose";

const taskEnrollmentSchema = new mongoose.Schema({
    memberId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Member",
        unique : true,
},
    tasks :{
        type : [mongoose.Schema.Types.ObjectId],  
        ref : "Task",
    },
},
{
   timestamps : true
}
);

const TaskEnrollment = mongoose.model("TaskEnrollment", taskEnrollmentSchema);
export default TaskEnrollment;