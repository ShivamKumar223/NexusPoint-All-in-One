import mongoose from "mongoose";

const teamEnrollmentSchema = new mongoose.Schema({
    memberId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Member"
    },
    teams :{
        type : [mongoose.Schema.Types.ObjectId],  
        ref : "Team",
        unique : true,  //Note : 👈 Ensures duplicate Member IDs cannot be added to this array
    }
},
{
    timestamps : true,
});

const TeamEnrollment = mongoose.model("TeamEnrollment", teamEnrollmentSchema);
export default TeamEnrollment;