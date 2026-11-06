import mongoose from "mongoose";

const moduleEnrollmentSchema = new mongoose.Schema({
    memberId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Member",
        unique : true
    },
    modules : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : "Module"
    }
}, 
{
    timestamps : true
});

const ModuleEnrollment = mongoose.model("ModuleEnrollment", moduleEnrollmentSchema);
export default ModuleEnrollment;